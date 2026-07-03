create table if not exists public.customer_accounts (
  id uuid primary key,
  name text not null check (char_length(name) between 2 and 80),
  email text not null unique,
  phone text not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customer_accounts_email_lower_idx
  on public.customer_accounts (lower(email));

alter table public.customer_accounts enable row level security;
revoke all on public.customer_accounts from anon, authenticated;

alter table public.orders
  add column if not exists customer_id uuid references public.customer_accounts(id) on delete set null;

create index if not exists orders_customer_id_created_at_idx
  on public.orders (customer_id, created_at desc);
