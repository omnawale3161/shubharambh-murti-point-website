alter table public.products
  add column if not exists sku text,
  add column if not exists stock integer not null default 0 check (stock >= 0),
  add column if not exists reserved_stock integer not null default 0 check (reserved_stock >= 0),
  add column if not exists low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0);

update public.products
set stock = stock_count
where stock = 0 and stock_count > 0;

create unique index if not exists products_sku_unique_idx
  on public.products (sku) where sku is not null;
create index if not exists products_inventory_status_idx
  on public.products (is_active, stock, low_stock_threshold);

alter table public.orders
  add column if not exists inventory_state text not null default 'unreserved'
  check (inventory_state in ('unreserved', 'reserved', 'committed', 'released'));

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  order_id uuid references public.orders(id) on delete set null,
  movement_type text not null check (movement_type in ('manual_adjustment', 'reservation', 'reservation_release', 'sale', 'sale_restore')),
  quantity integer not null check (quantity <> 0),
  stock_after integer not null check (stock_after >= 0),
  reserved_after integer not null check (reserved_after >= 0),
  note text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists stock_movements_product_created_idx
  on public.stock_movements (product_id, created_at desc);
create index if not exists stock_movements_order_idx
  on public.stock_movements (order_id) where order_id is not null;

alter table public.stock_movements enable row level security;
revoke all on public.stock_movements from anon, authenticated;
grant select, insert on public.stock_movements to authenticated;

create policy "Admins read stock movements" on public.stock_movements for select to authenticated
  using (public.is_admin());
create policy "Admins create stock movements" on public.stock_movements for insert to authenticated
  with check (public.is_admin());

create or replace function public.reserve_order_inventory(target_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  product_row public.products%rowtype;
  requested integer;
  current_state text;
begin
  select inventory_state into current_state from public.orders where id = target_order_id for update;
  if current_state <> 'unreserved' then
    return;
  end if;

  for item in select value from jsonb_array_elements((select order_items from public.orders where id = target_order_id))
  loop
    requested := greatest(1, (item ->> 'quantity')::integer);
    select * into product_row
    from public.products
    where sku = item ->> 'productId' or slug = item ->> 'productSlug'
    order by case when sku = item ->> 'productId' then 0 else 1 end
    limit 1
    for update;

    if product_row.id is null then
      raise exception 'Inventory product is not configured for %', item ->> 'productName' using errcode = 'P0001';
    end if;
    if not product_row.is_active or product_row.stock - product_row.reserved_stock < requested then
      raise exception 'Insufficient stock for %', product_row.name using errcode = 'P0001';
    end if;

    update public.products
    set reserved_stock = reserved_stock + requested, stock_count = stock
    where id = product_row.id
    returning * into product_row;

    insert into public.stock_movements (product_id, order_id, movement_type, quantity, stock_after, reserved_after, note)
    values (product_row.id, target_order_id, 'reservation', requested, product_row.stock, product_row.reserved_stock, 'Reserved during checkout');
  end loop;

  update public.orders set inventory_state = 'reserved', updated_at = now() where id = target_order_id;
end;
$$;

create or replace function public.set_order_status_with_inventory(target_order_id uuid, next_status text, next_tracking_number text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_state text;
  item jsonb;
  product_row public.products%rowtype;
  requested integer;
begin
  select inventory_state into current_state from public.orders where id = target_order_id for update;
  if current_state is null then raise exception 'Order not found' using errcode = 'P0001'; end if;

  if next_status = 'confirmed' and current_state = 'reserved' then
    for item in select value from jsonb_array_elements((select order_items from public.orders where id = target_order_id))
    loop
      requested := greatest(1, (item ->> 'quantity')::integer);
      select * into product_row from public.products
      where sku = item ->> 'productId' or slug = item ->> 'productSlug'
      order by case when sku = item ->> 'productId' then 0 else 1 end limit 1 for update;
      update public.products
      set stock = stock - requested, stock_count = stock - requested, reserved_stock = reserved_stock - requested
      where id = product_row.id returning * into product_row;
      insert into public.stock_movements (product_id, order_id, movement_type, quantity, stock_after, reserved_after, note)
      values (product_row.id, target_order_id, 'sale', -requested, product_row.stock, product_row.reserved_stock, 'Committed when order confirmed');
    end loop;
    current_state := 'committed';
  elsif next_status in ('cancelled', 'payment_failed') and current_state = 'reserved' then
    for item in select value from jsonb_array_elements((select order_items from public.orders where id = target_order_id))
    loop
      requested := greatest(1, (item ->> 'quantity')::integer);
      select * into product_row from public.products
      where sku = item ->> 'productId' or slug = item ->> 'productSlug'
      order by case when sku = item ->> 'productId' then 0 else 1 end limit 1 for update;
      update public.products set reserved_stock = reserved_stock - requested
      where id = product_row.id returning * into product_row;
      insert into public.stock_movements (product_id, order_id, movement_type, quantity, stock_after, reserved_after, note)
      values (product_row.id, target_order_id, 'reservation_release', -requested, product_row.stock, product_row.reserved_stock, 'Reservation released');
    end loop;
    current_state := 'released';
  elsif next_status = 'cancelled' and current_state = 'committed' then
    for item in select value from jsonb_array_elements((select order_items from public.orders where id = target_order_id))
    loop
      requested := greatest(1, (item ->> 'quantity')::integer);
      select * into product_row from public.products
      where sku = item ->> 'productId' or slug = item ->> 'productSlug'
      order by case when sku = item ->> 'productId' then 0 else 1 end limit 1 for update;
      update public.products set stock = stock + requested, stock_count = stock + requested
      where id = product_row.id returning * into product_row;
      insert into public.stock_movements (product_id, order_id, movement_type, quantity, stock_after, reserved_after, note)
      values (product_row.id, target_order_id, 'sale_restore', requested, product_row.stock, product_row.reserved_stock, 'Stock restored after cancellation');
    end loop;
    current_state := 'released';
  end if;

  update public.orders set
    status = next_status,
    inventory_state = current_state,
    tracking_number = coalesce(nullif(next_tracking_number, ''), tracking_number),
    shipped_at = case when next_status = 'shipped' then now() else shipped_at end,
    delivered_at = case when next_status = 'delivered' then now() else delivered_at end,
    updated_at = now()
  where id = target_order_id;
end;
$$;

create or replace function public.admin_adjust_stock(target_product_id uuid, new_stock integer, adjustment_note text default '')
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  product_row public.products%rowtype;
  difference integer;
begin
  if not public.is_admin() then raise exception 'Administrator access required' using errcode = '42501'; end if;
  if new_stock < 0 then raise exception 'Stock cannot be negative' using errcode = '22023'; end if;
  select * into product_row from public.products where id = target_product_id for update;
  if new_stock < product_row.reserved_stock then raise exception 'Stock cannot be lower than reserved stock' using errcode = '22023'; end if;
  difference := new_stock - product_row.stock;
  update public.products set stock = new_stock, stock_count = new_stock where id = target_product_id returning * into product_row;
  if difference <> 0 then
    insert into public.stock_movements (product_id, movement_type, quantity, stock_after, reserved_after, note, created_by)
    values (target_product_id, 'manual_adjustment', difference, product_row.stock, product_row.reserved_stock, left(adjustment_note, 300), auth.uid());
  end if;
end;
$$;

grant execute on function public.admin_adjust_stock(uuid, integer, text) to authenticated;
revoke execute on function public.reserve_order_inventory(uuid) from public, anon, authenticated;
revoke execute on function public.set_order_status_with_inventory(uuid, text, text) from public, anon, authenticated;
grant execute on function public.reserve_order_inventory(uuid) to service_role;
grant execute on function public.set_order_status_with_inventory(uuid, text, text) to service_role;
