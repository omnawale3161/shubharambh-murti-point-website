create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  name text not null check (char_length(name) between 2 and 80),
  city text not null check (char_length(city) between 2 and 80),
  rating integer not null check (rating between 1 and 5),
  quote text not null check (char_length(quote) between 10 and 700),
  is_approved boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists product_reviews_product_approved_created_idx
  on public.product_reviews (product_id, is_approved, created_at desc);

alter table public.product_reviews enable row level security;

drop policy if exists "Anyone can read approved product reviews" on public.product_reviews;
create policy "Anyone can read approved product reviews"
  on public.product_reviews
  for select
  using (is_approved = true);

drop policy if exists "Anyone can submit product reviews" on public.product_reviews;
create policy "Anyone can submit product reviews"
  on public.product_reviews
  for insert
  with check (true);
