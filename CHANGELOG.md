# Changelog

## Production Admin Inventory Management

### Added

- Admin dashboard metrics for orders, revenue, pending/paid orders, low stock, and out-of-stock products.
- Searchable and filterable order management with fulfilment updates, invoice access, and CSV export.
- Inventory dashboard with SKU-based stock, reservations, low-stock thresholds, bulk updates, and movement history.
- Reports for best-selling products, daily/monthly revenue, stock health, and low-stock products.
- Live storefront stock badges, remaining quantity, and disabled purchase controls for unavailable products.
- Atomic Supabase inventory reservation, confirmation reduction, cancellation restoration, and stock-movement ledger in `supabase/migrations/005_inventory_management.sql`.

### Security

- Checkout and order inventory RPCs are executable only by the Supabase service role.
- Manual stock adjustment RPCs require an authenticated administrator.
- Checkout validates and reserves available stock server-side before returning success.

## Checkout Order Confirmation Popup

### Added

- Flipkart/Amazon-style order confirmation modal shown after successful COD creation or verified online payment.
- Animated success check, light confetti, order ID, total, payment method, and estimated delivery date.
- Three-second automatic redirect with immediate tracking, invoice download, and continue-shopping actions.
- Global Sonner notifications for successful orders, invoice downloads, and copied tracking links.
- Framer Motion modal, checkmark, confetti, fade, and scale animations.
- Desktop and mobile Playwright coverage for the complete confirmation modal flow.

## Production Post-Checkout Experience

### Added

- Secure `/order-success` confirmation experience with animated success state, confetti, order details, delivery estimate, tracking, invoice, shopping, and WhatsApp actions.
- Private `/orders/[id]` tracking page with reusable fulfilment timeline.
- Resend customer confirmations and store-owner alerts with branded HTML templates.
- GST-ready PDF invoice generation and protected invoice downloads.
- WhatsApp support confirmation messages containing order and delivery details.
- Expanded fulfilment statuses, tracking number, shipping/delivery timestamps, customer contact fields, invoice metadata, delivery estimate, and private access-token hash.
- Admin orders dashboard with search, details, fulfilment updates, tracking numbers, and CSV export.
- Post-checkout migration at `supabase/migrations/004_post_checkout.sql`.

### Security

- Guest order, tracking, and invoice access requires a cryptographically random token; only its SHA-256 hash is stored.
- Customer emails and invoices are generated from server-trusted persisted order records.
- Admin order operations and exports require an authenticated Supabase administrator.

## Development Chunk Stability

- Development output now uses `.next-dev` while production builds continue using `.next`.
- This prevents production builds from replacing active development chunks and causing browser `ChunkLoadError` failures.

## Buy Now and Checkout Experience

### Added

- Product quantity selector, stock availability, primary Buy Now action, and quantity-aware Add to Cart.
- Responsive `/checkout` route supporting isolated Buy Now and complete cart checkout.
- Validated Maharashtra delivery address form and integrated PIN code checker.
- Order summary, price details, free-shipping threshold, payment selection, and Cash on Delivery.
- Server-verified multi-item checkout totals and persisted order items, address, payment method, shipping, and discount fields.
- Supabase checkout migration at `supabase/migrations/003_checkout.sql`.

### Security

- Product prices, gift-box totals, shipping, discounts, and grand totals are recalculated server-side.
- Card, UPI, wallet, and net-banking credentials remain inside Razorpay Checkout.
- Cash on Delivery orders are created server-side without requiring Razorpay credentials.
- Online checkout now reuses the public Razorpay key ID safely, requires only the server-side key secret for order creation, and reports missing local configuration precisely.
- Razorpay webhook secrets are required only by webhook processing, not normal checkout order creation.

## Dynamic Delivery Availability Checker

### Added

- Reusable `PincodeChecker` on product details and cart checkout surfaces.
- Server-side India Post PIN code lookup route with an eight-second timeout.
- Typed India Post response parsing for state, district, and post office details.
- Maharashtra-only availability messaging, loading state, invalid PIN handling, empty-response handling, and network-failure handling.
- Unit coverage for Indian PIN validation and delivery-response parsing.

### Verification

- Maharashtra PIN `411001`: available, Pune details returned.
- Non-Maharashtra PIN `110001`: unavailable, Delhi details returned.
- Invalid PIN: rejected with HTTP `400`.
- ESLint, TypeScript, 16 unit tests, and production build: passed.

## Supabase Commerce Backend

### Added

- Supabase schema for profiles, products, categories, contact submissions, and product image Storage.
- Row Level Security policies and protected administrator role checks.
- Typed Supabase browser, server, and service-role clients with environment validation.
- Product and category CRUD APIs, contact API, and authenticated image-upload API.
- Server Actions for product, category, contact, image, and admin-auth mutations.
- Protected admin dashboard with product, category, upload, and enquiry management.
- Operational loading and error states.
- Backend validation unit tests and setup documentation.

### Security

- Public users can only read active catalog records and submit new enquiries.
- Admin mutations require both a valid Supabase session and `profiles.role = 'admin'`.
- Public users cannot promote their own profile role.
- Uploads are restricted to approved image MIME types and 5 MB.
- Supabase service-role credentials remain server-only.

## Sacred Elegance Stitch Integration

### Added

- Sacred Elegance design tokens, EB Garamond and DM Sans fonts, announcement bar, WhatsApp action, and mobile bottom navigation.
- Search, signup alias, forgot-password, order history/detail, and address-management route surfaces.
- Server-only typed Excel readers and sample idol, frame, and decor workbooks.
- Product and search API compatibility routes.
- JSON-LD regression coverage.

### Changed

- Refined the shared shell, home, collections, product, cart, authentication, about, and account experiences to follow the supplied Stitch visual direction.
- Updated product cards, quick actions, filters, global search, and account navigation.
- Updated the mobile E2E navigation locator to use its accessible label.

### Security

- Removed `xlsx` after identifying unpatched high-severity advisories.
- Added maintained `read-excel-file` for server-only workbook parsing.
- Preserved Auth.js, Supabase, stable product identity, normalized cart persistence, and server-verified Razorpay flows.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 9 tests.
- `npm run build`: passed, 73 generated routes.
- `npm run test:e2e`: passed, 4 desktop/mobile runs.
- Production dependency audit: no high or critical advisories.
- Runtime Excel API and protected-route smoke tests: passed.

See `STITCH_INTEGRATION_REPORT.md` for scope, architecture decisions, and deferred work.

## Phase 8 - Tooling and Deployment Readiness

### Added

- ESLint 9 flat configuration using Next.js Core Web Vitals and TypeScript rules.
- Modern standalone TypeScript validation with generated App Router route types.
- Seven Vitest unit tests covering product identity, pricing, delivery, and shop-storage contracts.
- Four Playwright E2E runs covering critical storefront journeys across desktop and mobile Chromium.
- GitHub Actions CI for linting, typechecking, unit tests, production builds, production dependency audits, and E2E tests.
- Node.js 22 CI/default runtime pinning with declared Node.js 22 through 24 compatibility.
- Final project analysis and Vercel deployment documentation.

### Changed

- TypeScript target upgraded from ES5 to ES2022.
- Deprecated TypeScript `baseUrl` configuration removed.
- Production builds explicitly use the verified webpack path.
- The intentional post-hydration browser-storage load has a narrowly documented ESLint exception.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 7 tests.
- `npm run build`: passed, 64 generated routes.
- `npm run test:e2e`: passed, 4 desktop/mobile runs.
- Production dependency audit: two known moderate Next.js-bundled PostCSS advisories remain; no high or critical advisories.

### Modified Files

- `.github/workflows/ci.yml`
- `.gitignore`
- `.nvmrc`
- `components/ShopProvider.tsx`
- `eslint.config.mjs`
- `package.json`
- `package-lock.json`
- `playwright.config.ts`
- `tests/e2e/storefront.spec.ts`
- `tests/unit/products.test.ts`
- `tests/unit/shop-storage.test.ts`
- `tsconfig.json`
- `vitest.config.ts`
- `ARCHITECTURE.md`
- `CHANGELOG.md`
- `DEPLOYMENT.md`
- `PHASE_8_MIGRATION.md`
- `PROJECT_ANALYSIS.md`
- `SECURITY.md`

## Phase 7 - Accessibility and UX

### Added

- Keyboard-accessible skip navigation targeting the main page content.
- Shared visible focus treatment and reduced-motion support.
- Focus-trapped product search dialog with Escape/backdrop close, background scroll lock, and focus restoration.
- App Router loading state and recoverable error boundary.
- Collection-filter empty state with a clear-filters action.

### Changed

- Search, filter, wishlist, cart quantity, delivery, review, and contact controls now expose clearer accessible names, states, labels, and live updates.
- Mobile search results and navigation menu respect narrow viewport widths.
- Large page headings scale down on small screens without affecting desktop presentation.
- Cart quantity controls meet a larger touch-target size.

### Migration

- No database, dependency, or environment-variable migration is required.
- The root layout now owns the `#main-content` skip-navigation target.
- New interactive controls should retain visible focus styles and accessible names.

### Verification

- Production build: passed.
- Next.js integrated TypeScript check: passed.
- Source audit confirmed skip navigation, reduced-motion behavior, dialog semantics, live regions, pressed states, and explicit form labels.
- Rendered production HTML confirmed the skip link, main-content target, loading/error assets, and accessible control attributes.
- In-app browser visual verification was unavailable in this session.
- Existing standalone `tsc --noEmit` and `npm run lint` remain deferred to Phase 8.

### Modified Files

- `app/error.tsx`
- `app/loading.tsx`
- `app/contact/page.tsx`
- `app/globals.css`
- `app/layout.tsx`
- `components/CartPageClient.tsx`
- `components/CollectionBrowser.tsx`
- `components/GlobalSearch.tsx`
- `components/GlobalSearchDialog.tsx`
- `components/Header.tsx`
- `components/ProductPurchasePanel.tsx`
- `components/ProductQuickActions.tsx`
- `components/ReviewsPanel.tsx`
- `ARCHITECTURE.md`
- `CHANGELOG.md`
- `PHASE_7_MIGRATION.md`

## Phase 6 - Performance

### Added

- Negotiated AVIF and WebP image delivery with responsive device widths and long-lived optimizer caching.
- Cached server-side product search endpoint returning lightweight result records.
- Dynamically loaded global search dialog and product reviews panel.
- Interaction-only loading for the Razorpay Checkout SDK.

### Changed

- Header search no longer serializes the complete product catalog into every page.
- Product, cart, search, hero, and UGC images now declare context-specific sizes and quality settings.
- Above-the-fold hero and product images receive explicit high fetch priority.
- Static storefront and product routes remain prerendered while public search results use short CDN caching.
- The existing system font stack is retained to avoid external font requests and font-driven layout shift.

### Migration

- No database or environment-variable migration is required.
- Vercel will negotiate AVIF/WebP through the Next.js image optimizer and cache generated variants.
- Keep `/_next/image` available through the deployment CDN.
- Source assets remain approximately 68 MB; future source-asset compression can reduce repository and first-transform cost without changing public URLs.

### Verification

- Production build: passed.
- Next.js integrated TypeScript check: passed.
- Production server confirmed cached search responses with `s-maxage=300, stale-while-revalidate=3600`.
- Homepage HTML confirmed responsive `/_next/image` variants.
- Image optimizer confirmed AVIF negotiation and a 30-day generated-image cache lifetime.
- Product HTML confirmed Razorpay Checkout is absent before user interaction.
- Existing standalone `tsc --noEmit` and `npm run lint` remain deferred to Phase 8.

### Modified Files

- `app/api/products/search/route.ts`
- `app/page.tsx`
- `app/products/[slug]/page.tsx`
- `components/CartPageClient.tsx`
- `components/GlobalSearch.tsx`
- `components/GlobalSearchDialog.tsx`
- `components/Header.tsx`
- `components/HeaderShopLinks.tsx`
- `components/ProductCard.tsx`
- `components/RazorpayButton.tsx`
- `next.config.mjs`
- `ARCHITECTURE.md`
- `CHANGELOG.md`
- `PHASE_6_MIGRATION.md`

## Phase 5 - SEO

### Added

- Centralized SEO configuration, metadata helpers, and structured-data builders.
- Page-specific titles, descriptions, canonical URLs, Open Graph tags, and Twitter cards.
- Dynamic product metadata using stable product slugs and product images.
- Dynamic collection metadata for valid collection filters.
- `robots.txt` with public crawling rules and private/API route exclusions.
- `sitemap.xml` containing public pages and all 43 stable product URLs with product images.
- LocalBusiness and WebSite JSON-LD.
- Product and BreadcrumbList JSON-LD on every product page.
- Explicit `noindex, nofollow` metadata for account, cart, wishlist, login, and registration pages.
- Safe JSON-LD serialization that escapes `<` characters.

### Changed

- Root metadata now uses the centralized site configuration.
- Public page metadata is tailored to each route instead of inheriting only generic root metadata.
- Private customer and shopping workflow routes are excluded from search indexing.

### Migration

- Submit `https://shubharambhmurti.com/sitemap.xml` in Google Search Console.
- Verify the production domain and inspect representative product URLs after deployment.
- LocalBusiness schema intentionally uses service areas because no verified public street address exists in the repository.

### Verification

- Production build: passed.
- Next.js integrated TypeScript check: passed.
- Build generated `/robots.txt` and `/sitemap.xml`.
- Source audit confirmed metadata coverage, canonical helpers, Twitter cards, and requested structured-data types.
- Product HTML confirmed canonical URL, Open Graph title, Twitter large-image card, LocalBusiness, Product, and BreadcrumbList schemas.
- Cart HTML confirmed `noindex, nofollow`.
- Sitemap confirmed 50 public URLs, including all 43 products.
- Robots endpoint confirmed sitemap declaration and private/API route exclusions.
- Existing standalone `tsc --noEmit` and `npm run lint` remain deferred to Phase 8.

### Modified Files

- `app/about/page.tsx`
- `app/account/page.tsx`
- `app/cart/page.tsx`
- `app/collections/page.tsx`
- `app/contact/page.tsx`
- `app/layout.tsx`
- `app/login/page.tsx`
- `app/page.tsx`
- `app/privacy-policy/page.tsx`
- `app/products/[slug]/page.tsx`
- `app/refund-policy/page.tsx`
- `app/register/page.tsx`
- `app/robots.ts`
- `app/shipping-policy/page.tsx`
- `app/sitemap.ts`
- `app/wishlist/page.tsx`
- `components/JsonLd.tsx`
- `lib/seo/config.ts`
- `lib/seo/index.ts`
- `lib/seo/metadata.ts`
- `lib/seo/schema.ts`
- `ARCHITECTURE.md`
- `CHANGELOG.md`
- `PHASE_5_MIGRATION.md`

## Phase 4 - Authentication

### Added

- Auth.js credentials authentication with secure JWT sessions and Auth.js-managed cookies.
- Supabase PostgreSQL customer account persistence.
- Server-side `scrypt` password hashing with unique salts.
- Constant-time password hash comparison.
- Validated and sanitized customer registration.
- Protected `/account` route using the Next.js 16 Auth.js proxy and page-level authorization.
- Authenticated customer order history.
- Authenticated customer ownership on newly created secure payment orders.
- Supabase authentication migration and required indexes/RLS posture.
- Auth.js session type augmentation.

### Changed

- Login now verifies persisted credentials before creating a session.
- Registration now creates a real customer account and automatically signs in.
- Account dashboard now reads trusted customer data and order history from Supabase.
- Logout now invalidates the Auth.js session.
- Login callback URLs are restricted to safe internal paths.

### Removed

- Editable JavaScript customer cookie.
- Prototype login that ignored passwords.
- Client-side customer-cookie parsing.
- Unprotected account dashboard behavior.

### Migration

- Install dependency: `next-auth@5.0.0-beta.31`.
- Apply `supabase/migrations/002_phase4_auth.sql`.
- Configure `AUTH_SECRET` in Vercel.
- Existing prototype customer cookies are ignored and may be removed by users naturally.

### Verification

- Production build: passed.
- Next.js integrated TypeScript check: passed.
- Build generated Auth.js handlers, registration API, protected dynamic account route, and Auth.js proxy.
- Source audit confirmed no remaining `document.cookie` or prototype customer-storage references.
- Unauthenticated `/account` request returned a redirect to `/login?callbackUrl=/account`.
- Registration failed closed with `503` while Supabase credentials were intentionally absent.
- Auth.js providers endpoint returned `200`; signed-out session endpoint returned `200` with `null`.
- Existing standalone `tsc --noEmit` and `npm run lint` remain deferred to Phase 8.

### Modified Files

- `.env.example`
- `app/account/page.tsx`
- `app/api/auth/[...nextauth]/route.ts`
- `app/api/auth/register/route.ts`
- `app/api/orders/route.ts`
- `app/login/page.tsx`
- `app/register/page.tsx`
- `auth.ts`
- `components/AccountPanel.tsx`
- `components/AuthForm.tsx`
- `lib/auth/index.ts`
- `lib/auth/password.ts`
- `lib/auth/repository.ts`
- `lib/auth/types.ts`
- `lib/auth/validation.ts`
- `lib/auth.ts` (removed)
- `lib/payments/types.ts`
- `lib/supabase/server.ts`
- `proxy.ts`
- `supabase/migrations/002_phase4_auth.sql`
- `types/next-auth.d.ts`
- `package.json`
- `package-lock.json`
- `ARCHITECTURE.md`
- `CHANGELOG.md`
- `PHASE_4_MIGRATION.md`
- `SECURITY.md`

## Phase 3 - Payment Security

### Added

- Server-side Razorpay order creation at `POST /api/orders`.
- Server-side Razorpay payment signature and payment-detail verification at `POST /api/payments/verify`.
- Signature-verified Razorpay webhook handling at `POST /api/payments/webhook`.
- Supabase PostgreSQL order and webhook-event persistence.
- Idempotent webhook event records keyed by Razorpay event ID.
- Server-only payment configuration validation.
- Constant-time HMAC signature comparison.
- Supabase SQL migration with constraints, indexes, RLS, and revoked client-table access.
- Secure checkout progress and failure states.

### Changed

- Razorpay checkout now sends only permanent product ID and gift-box selection to the server.
- Payable amounts are calculated exclusively from the trusted server catalog.
- The browser receives a server-created Razorpay order ID before opening checkout.
- Payment success is shown only after server verification.
- Razorpay checkout script now loads lazily.

### Removed

- Client-controlled Razorpay amounts.
- Direct browser-created Razorpay payments without server order IDs.
- Client reliance on `NEXT_PUBLIC_RAZORPAY_KEY_ID`.

### Migration

- Apply `supabase/migrations/001_phase3_payments.sql`.
- Configure the server-only variables documented in `.env.example`.
- Configure the Razorpay webhook URL as `/api/payments/webhook`.
- Subscribe the webhook to `payment.captured` and `payment.failed`.

### Verification

- Production build: passed.
- Next.js integrated TypeScript check: passed.
- API routes generated for order creation, payment verification, and webhooks.
- Source audit confirmed no client-provided payable price is sent to secure order creation.
- Checkout fails closed when server credentials or persistence are unavailable.
- Invalid products return `404`; unconfigured secure checkout returns `503`; unsigned webhooks return `401`.
- Production dependency audit reports two existing moderate vulnerabilities through Next.js bundled PostCSS; remediation remains part of Phase 8 dependency/tooling work.
- Existing standalone `tsc --noEmit` and `npm run lint` remain deferred to Phase 8.

### Modified Files

- `.env.example`
- `app/api/orders/route.ts`
- `app/api/payments/verify/route.ts`
- `app/api/payments/webhook/route.ts`
- `components/ProductPurchasePanel.tsx`
- `components/RazorpayButton.tsx`
- `lib/payments/config.ts`
- `lib/payments/index.ts`
- `lib/payments/razorpay.ts`
- `lib/payments/repository.ts`
- `lib/payments/signatures.ts`
- `lib/payments/types.ts`
- `lib/payments/validation.ts`
- `supabase/migrations/001_phase3_payments.sql`
- `ARCHITECTURE.md`
- `CHANGELOG.md`
- `PHASE_3_MIGRATION.md`
- `SECURITY.md`

## Phase 2 - Cart and State Management

### Added

- Versioned browser-storage envelopes using schema version `2`.
- Validated cart persistence containing only product IDs, quantities, and selected options.
- Validated wishlist persistence containing only product IDs.
- Automatic migration for valid legacy cart and wishlist product snapshots.
- Safe handling for malformed, unavailable, or quota-restricted browser storage.
- Hydration status for cart and wishlist consumers.
- Shared cart subtotal calculation in `lib/shop/pricing.ts`.
- Shop-domain types and public exports under `lib/shop/`.

### Changed

- `ShopProvider` now keeps normalized product-ID selections as its source of truth.
- Current product records and prices are resolved from the authoritative catalog at runtime.
- Storage writes begin only after persisted state has been read, preventing refresh-time cart loss.
- Cart and wishlist actions now use permanent product IDs instead of product slugs or snapshots.
- Cart and wishlist pages display neutral loading states until hydration finishes.
- Cart quantity decrement removes an item when its quantity reaches zero.
- Quantities are validated and capped at `99`.

### Migration

- Existing `shubharambh-cart` and `shubharambh-wishlist` keys are retained.
- Legacy arrays are migrated to versioned envelopes when products can be safely matched.
- Invalid and unmappable legacy entries are discarded.
- The migrated format is written automatically after hydration.

### Verification

- Production build: passed.
- Next.js integrated TypeScript check: passed.
- Source audit confirmed no remaining cart actions keyed by product slug or full-product persistence calls.
- Existing standalone `tsc --noEmit` and `npm run lint` remain deferred to Phase 8.

### Modified Files

- `components/CartPageClient.tsx`
- `components/CollectionBrowser.tsx`
- `components/HeaderShopLinks.tsx`
- `components/ProductPurchasePanel.tsx`
- `components/ProductQuickActions.tsx`
- `components/ShopProvider.tsx`
- `components/WishlistPageClient.tsx`
- `lib/shop/index.ts`
- `lib/shop/pricing.ts`
- `lib/shop/storage.ts`
- `lib/shop/types.ts`
- `ARCHITECTURE.md`
- `CHANGELOG.md`
- `PHASE_2_MIGRATION.md`

## Phase 1 - Product Domain Stabilization

### Added

- Permanent product IDs using the `smp-###` format.
- Deterministic, SEO-friendly product slugs for all 43 catalog records.
- Modular product domain under `lib/products/`.
- Catalog validation for IDs, slugs, collections, prices, images, and required fields.
- Product lookup helpers by ID, current slug, and legacy slug.
- Permanent redirects from known legacy product slugs.
- Safe fallback redirect from unmappable UUID-shaped legacy URLs to Collections.
- Shared pricing helpers and centralized gift-box pricing.

### Changed

- Normalized product names, size formatting, whitespace, and descriptions.
- Product ratings now derive from permanent IDs instead of array lookup by runtime slug.
- Product detail lookup now uses the product-domain repository helper.
- Cart and product purchase totals now use shared pricing functions.

### Removed

- Runtime UUID slug generation.
- The unused `uuid` dependency.
- Duplicate gift-box price constants.

### Verification

- Catalog validation: 43 records, 43 unique IDs, 43 unique slugs.
- Production build: passed with all 43 stable product routes generated.
- Stable product URL: returned `200`.
- Known legacy slug: returned permanent `308` redirect to its stable product URL.
- UUID-shaped legacy URL: returned permanent `308` redirect to Collections.
- Next.js integrated TypeScript build check: passed.
- Existing standalone `tsc --noEmit` remains blocked by deprecated `target` and `baseUrl` settings; deferred to Phase 8.
- Existing `npm run lint` remains blocked because Next.js 16 no longer supports `next lint`; deferred to Phase 8.

### Modified Files

- `app/products/[slug]/page.tsx`
- `components/CartPageClient.tsx`
- `components/CollectionBrowser.tsx`
- `components/GlobalSearch.tsx`
- `components/HeaderShopLinks.tsx`
- `components/ProductPurchasePanel.tsx`
- `lib/products.ts`
- `lib/products/catalog.ts`
- `lib/products/delivery.ts`
- `lib/products/index.ts`
- `lib/products/pricing.ts`
- `lib/products/reviews.ts`
- `lib/products/slug.ts`
- `lib/products/types.ts`
- `lib/products/validation.ts`
- `package.json`
- `package-lock.json`
