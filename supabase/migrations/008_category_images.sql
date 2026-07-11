alter table public.categories
  add column if not exists image_url text;

create index if not exists categories_active_sort_idx
  on public.categories (is_active, sort_order);

alter table public.products
  add column if not exists category_id uuid;

create index if not exists products_category_id_idx
  on public.products (category_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_category_id_fkey'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_category_id_fkey
      foreign key (category_id)
      references public.categories(id)
      on delete set null
      not valid;
  end if;
end;
$$;
