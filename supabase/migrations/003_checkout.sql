alter table public.orders
  add column if not exists quantity integer not null default 1 check (quantity > 0),
  add column if not exists order_items jsonb not null default '[]'::jsonb,
  add column if not exists delivery_address jsonb,
  add column if not exists payment_method text not null default 'razorpay_upi',
  add column if not exists shipping_paise integer not null default 0 check (shipping_paise >= 0),
  add column if not exists discount_paise integer not null default 0 check (discount_paise >= 0);

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('created', 'cod_pending', 'payment_authorized', 'paid', 'payment_failed'));
