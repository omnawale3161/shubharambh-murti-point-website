# Architecture

## Supabase Commerce Backend

The production backend uses Supabase Auth for the protected administrator
workspace and RLS-backed access to products, categories, contact submissions,
and product image Storage. Customer Auth.js and Razorpay flows remain intact
until a dedicated customer-account migration is approved.

```text
app/admin/                 Protected operational dashboard
app/api/products/          Public reads and authenticated CRUD
app/api/categories/        Public reads and authenticated CRUD
app/api/contact/           Public validated contact submissions
app/api/uploads/           Authenticated product-image uploads
lib/backend/               Authorization and mutation validation
lib/supabase/              Typed browser/server/admin clients
supabase/schema.sql        Database, triggers, RLS, and Storage policies
```

Server Actions are the primary admin mutation interface. API mutation routes
support external integrations and enforce the same authenticated admin role.
PostgreSQL RLS remains the final authorization boundary.

## Checkout Architecture

Buy Now routes to `/checkout` with only the selected product ID, quantity, and
gift-box option. Cart checkout reads normalized cart selections. In both modes,
the browser submits only product IDs, quantities, options, address, and payment
preference.

The order API resolves current catalog records and recalculates product totals,
gift-box charges, shipping, discounts, and grand total server-side. Online
methods use a server-created Razorpay order and server-side signature
verification. Cash on Delivery creates a persisted `cod_pending` order without
loading Razorpay.

## Post-Checkout Architecture

Persisted orders receive a private access-token hash and estimated delivery
date. Guest-facing success, tracking, and invoice routes require the raw access
token from the checkout response; the database stores only its SHA-256 hash.

Customer and owner confirmation emails use Resend after COD creation or
verified Razorpay payment. Razorpay webhooks provide notification recovery when
browser verification is interrupted. Fulfilment statuses are updated from the
protected admin workspace and rendered through one shared order timeline.

Invoices are generated on demand as private PDF responses. Admin order exports
require an authenticated Supabase administrator session.

## Sacred Elegance Storefront Layer

The Stitch Sacred Elegance concept is implemented as a presentation layer over the existing production domains. Shared visual tokens live in `app/globals.css`; the application shell owns the announcement bar, navigation, footer, WhatsApp action, and mobile navigation.

The product catalog, cart, authentication, order, payment, SEO, and accessibility contracts remain authoritative. Presentation components consume those contracts instead of embedding independent prototype state.

### Excel Import Boundary

```text
data/
├── idols.xlsx
├── frames.xlsx
└── decor.xlsx

lib/excel/
├── index.ts
├── readers.ts
└── types.ts
```

Excel parsing is server-only and exposed through the opt-in `/api/products?source=excel` endpoint. Imported records do not silently replace the validated production catalog; final records must be reviewed and migrated before becoming authoritative.

## Phase 1 Product Domain

The product domain is the authoritative source for catalog data and product-related business rules.

```text
lib/
├── products.ts              Compatibility facade
└── products/
    ├── catalog.ts           Validated product records and lookup helpers
    ├── delivery.ts          Delivery estimate rules
    ├── index.ts             Public product-domain API
    ├── pricing.ts           Prices and total calculations
    ├── reviews.ts           Reviews, UGC, and stable rating utility
    ├── slug.ts              Product URL and identifier rules
    ├── types.ts             Domain types
    └── validation.ts        Runtime catalog invariant checks
```

Application code continues importing from `@/lib/products`. The facade exports the modular domain API, preserving current component contracts while preventing direct coupling to individual domain files.

## Product Identity

- `Product.id` is the permanent internal identity and must never change after release.
- `Product.slug` is the permanent public URL identifier.
- Product records are validated and frozen when the catalog module loads.
- Cart and wishlist persistence reference products by permanent ID.

## URL Compatibility

- Current SEO slugs resolve directly through `getProductBySlug`.
- Known pre-UUID slugs permanently redirect to the matching current product URL.
- Historical UUID URLs cannot be matched to products because the old UUIDs were generated randomly and never persisted. UUID-shaped paths permanently redirect to `/collections`.

## Business Rules

- Pricing calculations and `GIFT_BOX_PRICE` live in `pricing.ts`.
- Delivery rules live in `delivery.ts`.
- Reviews and stable rating calculations live in `reviews.ts`.
- Catalog validation runs during development and production builds, failing fast when an invalid product is introduced.

## Phase 2 Shop State

The shop domain owns cart and wishlist persistence independently from React components.

```text
lib/
└── shop/
    ├── index.ts             Public shop-domain API
    ├── pricing.ts           Cart-level total calculations
    ├── storage.ts           Versioned parsing, migration, and persistence
    └── types.ts             Cart selection, options, and resolved item types
```

`ShopProvider` keeps normalized cart selections and wishlist product IDs in memory. It resolves current product records from the product catalog for UI consumers.

### Persisted Cart Contract

```json
{
  "version": 2,
  "items": [
    {
      "productId": "smp-001",
      "quantity": 1,
      "options": {
        "giftBox": false
      }
    }
  ]
}
```

### Persistence Guarantees

- Product details and prices are never trusted from browser storage.
- Stored IDs must resolve to the current validated product catalog.
- Quantities must be integers from `1` through `99`.
- Unknown options default safely.
- Duplicate cart variants are merged.
- Invalid records are discarded.
- Writes are gated until client hydration and storage reads complete.
- Storage failures preserve the in-memory shopping experience.

## Phase 3 Payment Boundary

Payment processing is server-authoritative and uses Razorpay orders with Supabase PostgreSQL persistence.

```text
app/api/
├── orders/route.ts              Creates trusted Razorpay orders
└── payments/
    ├── verify/route.ts          Verifies checkout signatures and payment details
    └── webhook/route.ts         Verifies and processes Razorpay webhooks

lib/payments/
├── config.ts                    Server-only environment validation
├── index.ts                     Public server payment API
├── razorpay.ts                  Razorpay REST client
├── repository.ts               Supabase REST persistence
├── signatures.ts               Constant-time HMAC verification
├── types.ts                    Payment and persisted-order contracts
└── validation.ts               Untrusted request parsing
```

### Secure Checkout Flow

1. The browser sends `productId` and `giftBox` to `POST /api/orders`.
2. The server resolves the product from the validated catalog and calculates the amount.
3. The server creates a Razorpay order and persists the authoritative order in Supabase.
4. The browser opens Razorpay Checkout using the server-created Razorpay order ID.
5. Checkout success data is sent to `POST /api/payments/verify`.
6. The server validates the HMAC signature, fetches the payment from Razorpay, and compares order ID, amount, currency, and status.
7. Signed webhooks provide asynchronous captured/failed payment reconciliation.

### Trust Boundaries

- Browser-provided prices, names, statuses, and payment claims are never trusted.
- Razorpay key secret, webhook secret, and Supabase service-role key are server-only.
- Public Supabase roles cannot access payment tables.
- Webhook payloads are processed only after raw-body signature verification.
- Payment event IDs provide an audit trail and duplicate-event protection.

## Phase 4 Authentication

Auth.js owns session lifecycle while Supabase PostgreSQL stores customer credentials and profiles.

```text
auth.ts                            Auth.js providers, JWT, and session callbacks
proxy.ts                           Request-level account route protection
app/api/auth/
├── [...nextauth]/route.ts         Auth.js route handlers
└── register/route.ts              Validated customer registration

lib/auth/
├── index.ts                       Public authentication-domain API
├── password.ts                    Scrypt hashing and verification
├── repository.ts                  Server-only customer and order queries
├── types.ts                       Customer and account-order contracts
└── validation.ts                  Credential and registration validation

lib/supabase/server.ts             Shared server-only Supabase REST client
```

### Authentication Flow

1. Registration validates and sanitizes customer input.
2. The server hashes passwords with `scrypt` and a unique random salt.
3. Customer credentials and profile data are persisted in Supabase.
4. Auth.js Credentials provider verifies email and password server-side.
5. Auth.js issues a signed JWT session using secure cookies.
6. `proxy.ts` rejects unauthenticated account requests.
7. The account page revalidates the session and reads the customer profile and order history from Supabase.

### Authentication Trust Boundaries

- Passwords and password hashes never enter browser sessions.
- Supabase service-role credentials remain server-only.
- Auth.js signs session tokens using `AUTH_SECRET`.
- Customer IDs enter payment orders only from verified Auth.js sessions.
- Public Supabase roles cannot access customer credential records.
- Account access is checked at both request and page layers.

## Phase 5 SEO

SEO configuration and structured data are centralized under `lib/seo/`.

```text
lib/seo/
├── config.ts                Canonical site identity and absolute URL builder
├── index.ts                 Public SEO-domain API
├── metadata.ts              Shared page and product metadata factories
└── schema.ts                JSON-LD builders and global schemas

components/JsonLd.tsx        Safe structured-data renderer
app/robots.ts                Search crawler policy
app/sitemap.ts               Public page and product sitemap
```

### Metadata Strategy

- Root metadata defines the site identity, title template, icons, Open Graph defaults, and Twitter defaults.
- Public pages provide route-specific metadata and canonical URLs.
- Product pages generate metadata from the authoritative product catalog.
- Valid collection filters receive targeted metadata and canonical query URLs.
- Customer, cart, wishlist, login, and registration routes are `noindex, nofollow`.

### Structured Data Strategy

- Root layout emits `Store`/`LocalBusiness` and `WebSite` schemas.
- Product pages emit `Product` and `BreadcrumbList` schemas.
- Schema identifiers use canonical absolute URLs.
- Product offers use trusted catalog prices and permanent product IDs.
- LocalBusiness uses verified service areas rather than inventing an unverified street address.

### Crawl Strategy

- Sitemap includes indexable public pages and every stable product URL.
- Robots rules allow the public storefront and exclude private customer workflows and API routes.
- Legacy product URL redirects preserve the stable canonical product destination.

## Phase 6 Performance

Performance work preserves the existing storefront design while reducing initial network and client-execution cost.

```text
app/api/products/search/route.ts   Cached lightweight catalog search
components/GlobalSearch.tsx        Small client-side search launcher
components/GlobalSearchDialog.tsx  Interaction-loaded search experience
next.config.mjs                    Image formats, widths, qualities, and cache policy
```

### Image Delivery

- Next Image negotiates AVIF and WebP and caches generated variants for at least 30 days.
- Responsive `sizes` declarations prevent large catalog source images from being delivered at desktop widths to small screens.
- Quality levels are tuned by visual context: smaller thumbnails use lower values while primary product imagery retains more detail.
- Only above-the-fold hero and product imagery receives high fetch priority.
- Source files remain unchanged so product image URLs and current visual behavior remain stable.

### Client Bundle Strategy

- Header search no longer receives or serializes the complete catalog on every route.
- The search dialog is loaded only after a customer opens search.
- Search requests are debounced, cancellable, and return a maximum of eight lightweight records.
- Product reviews are split from the main product page bundle.
- Razorpay Checkout loads only after a customer initiates secure checkout.

### Caching Strategy

- Home and informational storefront routes continue to prerender from the validated catalog.
- Collection and product routes render dynamically because availability and stock warnings must reflect current Supabase inventory.
- Public catalog search is served with short CDN caching and stale-while-revalidate.
- Payment, authentication, account, and Supabase-backed requests remain dynamic and uncached.
- Generated image variants use long-lived immutable-style optimizer caching.

### Font Strategy

The existing system font stack is intentionally retained. It requires no external font request, avoids font-file bundle cost, and minimizes font-driven layout shift.

## Phase 7 Accessibility and UX

Accessibility behavior is shared at the application shell and refined at each interactive workflow.

```text
app/layout.tsx                   Skip-navigation target and application shell
app/globals.css                 Focus visibility, reduced motion, mobile type safeguards
app/loading.tsx                 Shared route-transition loading surface
app/error.tsx                   Recoverable App Router error boundary
components/GlobalSearchDialog.tsx  Keyboard-managed modal search
```

### Keyboard and Focus Strategy

- A first-focus skip link moves keyboard users directly to `#main-content`.
- Interactive elements receive a consistent, high-contrast `:focus-visible` outline.
- The search dialog traps Tab focus, closes on Escape or backdrop interaction, restores the triggering control, and prevents background scrolling while open.
- Selected filters and wishlist controls expose their state using `aria-pressed`.

### Forms and Status Strategy

- Form controls use explicit labels or accessible names and appropriate autocomplete hints.
- Cart quantity controls announce both their action and affected product.
- Search results, filter counts, delivery estimates, quantities, checkout messages, and review confirmation use polite live-region behavior where appropriate.
- Loading and error states communicate status without discarding persisted cart or wishlist data.

### Responsive Strategy

- Search results collapse to a two-column layout on narrow screens.
- Mobile navigation width is constrained to the viewport.
- Large page titles scale down below the small-screen breakpoint.
- Frequently used quantity controls provide larger touch targets.

## Phase 8 Tooling and Delivery

The repository now has one repeatable quality pipeline for local development, pull requests, and production deployment.

```text
eslint.config.mjs             Next.js Core Web Vitals and TypeScript lint rules
vitest.config.ts              Node-based domain unit tests
playwright.config.ts          Desktop and mobile storefront E2E tests
tests/unit/                   Product and shop-state contract tests
tests/e2e/                    Critical customer journey tests
.github/workflows/ci.yml      Automated pull-request and main-branch gates
```

### Quality Gates

1. ESLint validates Next.js, React, accessibility-adjacent, and TypeScript patterns.
2. `next typegen` generates current route contracts before standalone TypeScript validation.
3. Vitest verifies stable product identity, pricing, delivery, and storage migration behavior.
4. The production build validates route generation and server/client boundaries.
5. The production dependency audit blocks high or critical advisories.
6. Playwright verifies desktop and mobile storefront journeys against the production server.

### Runtime and Deployment

- Node.js 22 is pinned locally and in GitHub Actions; `package.json` accepts supported Node.js 22 through 24 environments.
- Vercel remains the deployment target.
- Supabase PostgreSQL stores customer and order data.
- Supabase Storage remains the intended production media store.
- Auth.js, Razorpay verification, and all privileged Supabase access remain server-side.
