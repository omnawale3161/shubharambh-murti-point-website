# Phase 1 Migration Notes

## Product URLs

Product URLs changed from runtime-generated UUIDs to permanent SEO-friendly slugs.

Examples:

- `/products/premium-ganpati-murti-4-inch`
- `/products/shivaji-maharaj-murti-10-inch`
- `/products/adiyogi-murti-5-inch`

Known product slugs used before UUID generation redirect to the matching new URL. Previously generated UUID URLs redirect to `/collections` because no durable UUID-to-product mapping existed.

## Catalog Editing Rules

When adding a product:

1. Add a permanent unused ID in `smp-###` format.
2. Add a unique lowercase hyphenated slug.
3. Use one of the declared product collections.
4. Use a positive numeric INR price.
5. Store the image under `public/assets/` and reference it with `/assets/...`.

The build fails if these invariants are violated.

## Import Compatibility

Existing imports from `@/lib/products` remain valid. New code should also import from this public facade rather than reaching into `lib/products/*`.

## Phase Boundary

Cart and wishlist persistence was migrated to permanent product IDs in Phase 2. See `PHASE_2_MIGRATION.md`.
