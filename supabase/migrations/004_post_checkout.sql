alter table public.orders
  add column if not exists tracking_number text,
  add column if not exists estimated_delivery_date date,
  add column if not exists shipped_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists customer_phone text,
  add column if not exists customer_email text,
  add column if not exists invoice_url text,
  add column if not exists access_token_hash text,
  add column if not exists confirmation_sent_at timestamptz;

create unique index if not exists orders_access_token_hash_idx
  on public.orders (access_token_hash) where access_token_hash is not null;
create index if not exists orders_customer_email_created_at_idx
  on public.orders (customer_email, created_at desc);

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
    'delivered',
    'cancelled',
    'payment_failed'
  ));

