create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key,
  razorpay_order_id text not null unique,
  razorpay_payment_id text unique,
  product_id text not null,
  product_name text not null,
  amount_paise integer not null check (amount_paise > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  gift_box boolean not null default false,
  status text not null default 'created'
    check (status in ('created', 'payment_authorized', 'paid', 'payment_failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

create table if not exists public.payment_events (
  id text primary key,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.payment_events enable row level security;

revoke all on public.orders from anon, authenticated;
revoke all on public.payment_events from anon, authenticated;
