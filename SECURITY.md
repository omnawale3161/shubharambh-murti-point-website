# Security

## Payment Security

- All payable amounts are calculated from the trusted server catalog.
- Razorpay orders are created server-side.
- Checkout signatures are verified using HMAC-SHA256 and constant-time comparison.
- Verified payment details are fetched directly from Razorpay and matched against the persisted order.
- Webhook raw bodies are signature-verified before parsing or processing.
- Webhook events are recorded for auditability and duplicate-event protection.
- Orders and payment events are inaccessible to Supabase anonymous and authenticated browser roles.
- Checkout stock is reserved atomically through a service-role-only database function.
- Confirming an order commits its reservation; cancellation and failed payments release or restore inventory without trusting browser input.

## Secret Management

The following values are server-only:

- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

Supabase administrator access is enforced by authenticated sessions, the
`profiles.role = 'admin'` assignment, and Row Level Security. The public anon
key may be exposed to the browser; the service-role key must remain server-only.
Inventory movement history is admin-readable, while checkout reservation and
order stock-transition functions are executable only by the service role.

Guest order success, tracking, and invoice URLs use high-entropy access tokens.
Only token hashes are persisted. Resend API keys and store-owner addresses are
server-only environment variables.
- `AUTH_SECRET`

Store them in Vercel environment variables. Never commit them or expose them through `NEXT_PUBLIC_` variables.

## Operational Requirements

- Use separate Razorpay test and live credentials.
- Rotate credentials immediately if exposed.
- Restrict Supabase service-role usage to server routes.
- Monitor failed webhook deliveries and unresolved `payment_authorized` orders.
- Reconcile paid orders against the Razorpay dashboard before fulfilment when any discrepancy is reported.

## Authentication Security

- Auth.js owns secure session-cookie creation and invalidation.
- Passwords are hashed server-side using `scrypt` with unique random salts.
- Password verification uses constant-time comparison.
- Customer registration and credentials are validated and length-limited.
- Account routes are protected at both proxy and page levels.
- Customer credential tables are unavailable to Supabase browser roles.
- Authenticated customer identity is read from the verified session, never from checkout request input.

## Deferred Security Work

- Email verification, password reset, account recovery, rate limiting, bot protection, and a reviewed Content Security Policy remain future production hardening work.

## Supply Chain and CI

- The supported runtime range is Node.js 22 through 24; CI is pinned to Node.js 22.
- GitHub Actions installs dependencies with `npm ci`.
- CI runs ESLint, standalone TypeScript checks, unit tests, a production build, a high-severity production dependency audit, and Playwright E2E tests.
- Playwright failure reports are retained for seven days.
- Production dependency audits currently report two moderate PostCSS advisories bundled through Next.js. The available automated fix would downgrade Next.js to an unsafe incompatible version, so upgrades should be monitored and applied when Next.js ships a compatible resolution.
