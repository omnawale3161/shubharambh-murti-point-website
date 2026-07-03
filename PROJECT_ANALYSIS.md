# Project Analysis

## Architecture Overview

Shubharambh Murti Point is a Next.js App Router ecommerce storefront. Static catalog and informational routes are prerendered, while account, authentication, payment, and search APIs remain dynamic at their appropriate trust boundaries.

The repository separates product, shop-state, payment, authentication, SEO, and Supabase concerns under `lib/`. React components own presentation and client interaction. Server routes validate untrusted input and keep privileged credentials out of the browser.

## Route Map

- Public storefront: `/`, `/collections`, `/products/[slug]`, `/about`, `/contact`
- Customer workflows: `/cart`, `/wishlist`, `/login`, `/register`, `/account`
- Policies: `/privacy-policy`, `/refund-policy`, `/shipping-policy`
- SEO: `/robots.txt`, `/sitemap.xml`
- Server APIs: `/api/auth/*`, `/api/orders`, `/api/payments/*`, `/api/products/search`

## Production Strengths

- Stable permanent product identities and SEO-friendly URLs
- Runtime-validated authoritative catalog
- Versioned, normalized cart and wishlist persistence
- Server-authoritative Razorpay ordering and verification
- Auth.js sessions with Supabase customer persistence
- Complete metadata, sitemap, robots, and structured-data coverage
- Optimized image delivery, lazy loading, and safe caching boundaries
- Shared accessibility primitives, error boundaries, and loading states
- Automated lint, type, unit, build, audit, and E2E gates

## Remaining Operational Work

- Apply and verify all Supabase migrations in production.
- Configure and verify Razorpay live webhooks.
- Add verified business street address and hours when available.
- Move large source media into a managed Supabase Storage optimization pipeline.
- Add email verification, password reset, rate limiting, bot protection, and a reviewed Content Security Policy.
- Monitor the two moderate PostCSS advisories bundled through Next.js.
- Connect Google Analytics and Search Console after production-domain verification.

## Quality Baseline

- ESLint: passing
- Standalone TypeScript: passing
- Unit tests: 7 passing
- Production build: passing with 64 routes
- Playwright: 4 desktop/mobile runs passing
- Production dependency audit: no high or critical advisories
