# Phase 3 Migration Notes

## Supabase PostgreSQL

Run the following migration in the target Supabase project:

```text
supabase/migrations/001_phase3_payments.sql
```

It creates:

- `public.orders`
- `public.payment_events`
- Required constraints and indexes
- Row Level Security with no browser-client access

Only the server-side Supabase service-role key can access these tables.

## Vercel Environment Variables

Configure these variables for Preview and Production:

```text
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

`NEXT_PUBLIC_RAZORPAY_KEY_ID` is no longer used and can be removed after deployment verification.

Never expose the Razorpay key secret, webhook secret, or Supabase service-role key with a `NEXT_PUBLIC_` prefix.

## Razorpay Webhook

Configure the webhook endpoint:

```text
https://shubharambhmurti.com/api/payments/webhook
```

Subscribe to:

- `payment.captured`
- `payment.failed`

Set the same webhook secret in Razorpay and `RAZORPAY_WEBHOOK_SECRET`.

## Deployment Behavior

- Online checkout fails closed until all server credentials and Supabase tables are available.
- WhatsApp ordering, cart, wishlist, and product browsing continue working without payment configuration.
- Test mode and live mode credentials must never be mixed.

## Phase Boundary

Customer authentication and account-linked order history remain deferred to Phase 4.
