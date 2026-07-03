# Phase 4 Migration Notes

## Supabase PostgreSQL

Apply:

```text
supabase/migrations/002_phase4_auth.sql
```

This creates the `customer_accounts` table, protects it with RLS and revoked browser-role access, and links secure payment orders to authenticated customers.

## Auth.js Configuration

Configure this server-only Vercel environment variable:

```text
AUTH_SECRET
```

Generate a strong secret with:

```bash
npx auth secret
```

The existing `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` variables are also required.

For local registration and login, add both variables to `.env.local` and apply
`supabase/migrations/002_phase4_auth.sql` to the same Supabase project. Restart
the Next.js development server after changing environment variables.

## Existing Prototype Accounts

The previous account implementation did not persist real credentials. Existing prototype customer cookies cannot be migrated and are ignored.

Customers must create a new secure account after deployment.

## Authentication Behavior

- `/account` redirects unauthenticated visitors to `/login`.
- Registration creates a Supabase customer account and signs the customer in.
- New secure online orders are linked to the authenticated customer.
- Orders placed while signed out remain valid but are not attached to a customer account.

## Operational Follow-Up

Before public launch, configure:

- Email verification
- Password reset and account recovery
- Registration/login rate limiting
- Bot protection

These controls require transactional email and edge-rate-limiting provider decisions.

## Phase Boundary

SEO metadata, sitemap, structured data, and robots configuration remain deferred to Phase 5.
