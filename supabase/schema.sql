create extension if not exists pgcrypto;

create type public.app_role as enum ('customer', 'admin');
create type public.contact_status as enum ('new', 'in_progress', 'resolved', 'spam');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role public.app_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null check (char_length(name) between 2 and 160),
  slug text not null unique,
  description text not null default '',
  price_paise integer not null check (price_paise >= 0),
  compare_at_price_paise integer check (compare_at_price_paise is null or compare_at_price_paise >= price_paise),
  stock_count integer not null default 0 check (stock_count >= 0),
  image_url text,
  image_urls text[] not null default '{}',
  image_path text,
  material text not null default '',
  size text not null default '',
  badge text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  email text,
  phone text not null check (char_length(phone) between 10 and 20),
  message text not null check (char_length(message) between 10 and 2000),
  status public.contact_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_active_featured_idx on public.products(is_active, is_featured);
create index if not exists categories_active_sort_idx on public.categories(is_active, sort_order);
create index if not exists contact_submissions_status_created_idx on public.contact_submissions(status, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();
drop trigger if exists contact_submissions_updated_at on public.contact_submissions;
create trigger contact_submissions_updated_at before update on public.contact_submissions
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.contact_submissions enable row level security;

revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;

create policy "Users read own profile" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy "Users update own display name" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "Public reads active categories" on public.categories for select
  using (is_active or public.is_admin());
create policy "Admins insert categories" on public.categories for insert to authenticated
  with check (public.is_admin());
create policy "Admins update categories" on public.categories for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete categories" on public.categories for delete to authenticated
  using (public.is_admin());

create policy "Public reads active products" on public.products for select
  using (is_active or public.is_admin());
create policy "Admins insert products" on public.products for insert to authenticated
  with check (public.is_admin());
create policy "Admins update products" on public.products for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete products" on public.products for delete to authenticated
  using (public.is_admin());

create policy "Anyone submits contact forms" on public.contact_submissions for insert
  to anon, authenticated with check (status = 'new');
create policy "Admins read contact forms" on public.contact_submissions for select to authenticated
  using (public.is_admin());
create policy "Admins update contact forms" on public.contact_submissions for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete contact forms" on public.contact_submissions for delete to authenticated
  using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public reads product images" on storage.objects for select
  using (bucket_id = 'product-images');
create policy "Admins upload product images" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "Admins update product images" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
create policy "Admins delete product images" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
