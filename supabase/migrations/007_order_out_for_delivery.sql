alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in (
    'created',
    'cod_pending',
    'payment_authorized',
    'paid',
    'confirmed',
    'packed',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'payment_failed'
  ));

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
    shipped_at = case when next_status in ('shipped', 'out_for_delivery') then coalesce(shipped_at, now()) else shipped_at end,
    delivered_at = case when next_status = 'delivered' then now() else delivered_at end,
    updated_at = now()
  where id = target_order_id;
end;
$$;

revoke execute on function public.set_order_status_with_inventory(uuid, text, text) from public, anon, authenticated;
grant execute on function public.set_order_status_with_inventory(uuid, text, text) to service_role;
