# Deployment

## Target Platform

- Hosting: Vercel
- Database: Supabase PostgreSQL
- File storage: Supabase Storage
- Authentication: Auth.js
- Payments: Razorpay with server-side verification
- Analytics: Google Analytics and Google Search Console

## Required Environment Variables

Configure these as encrypted Vercel environment variables:

```text
AUTH_SECRET
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Never prefix server secrets with `NEXT_PUBLIC_`.

## Database Setup

Apply migrations in order:

```text
supabase/migrations/001_phase3_payments.sql
supabase/migrations/002_phase4_auth.sql
```

Verify RLS and confirm anonymous/authenticated browser roles cannot read customer credentials, orders, payment events, or webhook events.

## Pre-Deployment Gate

Use Node.js 22 and run:

```bash
npm ci
npm run check
npx playwright install chromium
npm run test:e2e
```

## Vercel Configuration

1. Import the repository and select Node.js 22.
2. Configure all required environment variables for Preview and Production.
3. Keep the default Next.js build/output settings.
4. Deploy Preview and complete checkout/auth smoke tests with test credentials.
5. Promote the verified deployment to Production.

## Post-Deployment Checks

1. Verify `/`, `/collections`, representative product URLs, `/robots.txt`, and `/sitemap.xml`.
2. Confirm account-route protection and customer registration/login.
3. Confirm Razorpay live order creation, signature verification, and webhook delivery.
4. Submit the sitemap in Search Console.
5. Connect Google Analytics without exposing privileged credentials.
6. Monitor Vercel logs, Supabase logs, Razorpay webhook failures, and CI results.

## Rollback

Use Vercel deployment rollback for application regressions. Database migrations should be corrected with reviewed forward migrations rather than destructive rollback commands.
