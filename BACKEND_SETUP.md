# Supabase Backend Setup

## Architecture

The existing Auth.js customer and Razorpay checkout flows remain intact. Supabase Auth is the identity provider for the protected `/admin` workspace. All admin mutations use the signed-in Supabase session and are enforced again by PostgreSQL Row Level Security.

```text
app/
├── admin/                         Supabase-authenticated admin workspace
├── api/categories/                Category CRUD API
├── api/contact/                   Public contact submission API
├── api/products/                  Product CRUD API with catalog fallback
└── api/uploads/                   Authenticated Storage upload API
components/admin/                  Operational admin forms and navigation
lib/backend/                       Authorization and input validation
lib/supabase/                      Browser, server, admin clients and DB types
supabase/schema.sql                Tables, triggers, RLS, and Storage policies
```

## Environment

Configure locally and in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RAZORPAY_KEY_ID=rzp_test_or_live_key_id
RAZORPAY_KEY_SECRET=your_server_only_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

The service-role key is server-only. Never prefix it with `NEXT_PUBLIC_`.
The Razorpay key secret and webhook secret are also server-only. Checkout can
reuse `NEXT_PUBLIC_RAZORPAY_KEY_ID` as the key ID, but it can never operate
without `RAZORPAY_KEY_SECRET`.

## Database

Run `supabase/schema.sql` in the Supabase SQL editor. It creates:

- `profiles`
- `categories`
- `products`
- `contact_submissions`
- `product-images` Storage bucket
- Admin-aware RLS policies and user-profile trigger

If the existing payment schema has already been deployed, also apply:

```text
supabase/migrations/003_checkout.sql
```

This adds quantity, normalized order items, delivery address, payment method,
shipping, discount, and Cash on Delivery status support to existing orders.
Checkout performs a schema preflight before creating a Razorpay order, so a
missing migration cannot create orphaned Razorpay orders.

For post-checkout success, tracking, notifications, invoices, and fulfilment,
also apply:

```text
supabase/migrations/004_post_checkout.sql
```

For inventory management and automatic stock control, apply:

```text
supabase/migrations/005_inventory_management.sql
```

After applying migration `005`, ensure every Supabase product has a unique SKU
matching its storefront catalog ID, such as `smp-001`, or a slug matching its
storefront product slug. Set current stock and low-stock thresholds from
`/admin/inventory` before accepting checkout orders.

Configure branded order emails:

```env
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Shubharambh Murti Point <orders@your-verified-domain.com>
STORE_OWNER_EMAIL=owner@example.com
STORE_GSTIN=optional-gstin-for-invoices
```

Verify the sender domain in Resend before production deployment. Email failures
do not roll back valid orders or payments.

Guest order-success, tracking, and invoice routes require both the UUID order
ID and a cryptographically random access token. Never log or expose that token
outside the customer confirmation URL.

## First Administrator

1. Create a user in Supabase Authentication.
2. Promote the profile from the SQL editor using a trusted administrator session:

```sql
update public.profiles
set role = 'admin'
where id = 'AUTH_USER_UUID';
```

Administrators sign in at `/admin/login`. Public signup cannot grant the admin role.

## Data Migration

The storefront's validated TypeScript catalog remains the fallback until products are imported into Supabase. Once production records are reviewed, the public product APIs will return active Supabase products automatically.
