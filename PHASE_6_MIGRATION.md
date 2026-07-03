# Phase 6 Migration Notes

## Deployment

No database migration or new environment variable is required.

Deploy the completed production build to Vercel. Ensure the deployment does not bypass or block the Next.js `/_next/image` endpoint, because it now negotiates and caches AVIF/WebP image variants.

## Image Optimization

The application now uses the Next.js image optimizer with:

- AVIF and WebP negotiation
- Responsive device and thumbnail widths
- Explicit supported quality levels
- A minimum generated-image cache lifetime of 30 days

Product image URLs and source assets are unchanged. The source asset directory remains approximately 68 MB. A later asset-pipeline task may compress originals to reduce repository size and first-transform work without changing public URLs.

## Search

Global header search now calls:

```text
GET /api/products/search?q=<query>
```

The endpoint returns a small result set and uses public CDN caching. Empty queries return popular products; typed queries return matching products. No external search service is required for the current catalog size.

## Lazy Loading

- The global search dialog loads after the search button is opened.
- Product reviews load as a separate product-page chunk.
- Razorpay Checkout loads after the customer clicks the payment button.

These changes do not alter existing workflows or payment trust boundaries.

## Caching Boundaries

- Static catalog pages remain prerendered.
- Product search uses short public CDN caching with stale-while-revalidate.
- Authenticated account, payment, webhook, and Supabase-backed requests remain uncached.

## Verification

- Production build and Next.js integrated TypeScript validation passed.
- Search endpoint returned `200` with `s-maxage=300, stale-while-revalidate=3600`.
- Homepage HTML emitted responsive `/_next/image` URLs.
- Image optimizer returned AVIF with a 30-day public cache lifetime.
- Initial product HTML did not contain the Razorpay Checkout script.

## Phase Boundary

Focus management, keyboard navigation, form-label improvements, error boundaries, loading states, and mobile accessibility work remain deferred to Phase 7.
