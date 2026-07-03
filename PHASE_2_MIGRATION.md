# Phase 2 Migration Notes

## Storage Version

Cart and wishlist storage now use schema version `2`.

The existing browser-storage keys remain unchanged:

- `shubharambh-cart`
- `shubharambh-wishlist`

## New Cart Format

```json
{
  "version": 2,
  "items": [
    {
      "productId": "smp-001",
      "quantity": 2,
      "options": {
        "giftBox": true
      }
    }
  ]
}
```

The wishlist envelope stores only permanent product IDs.

## Automatic Migration

On the first client hydration after deployment:

1. Version `2` records are validated before use.
2. Legacy product snapshots are matched to the current catalog using permanent IDs, current slugs, known legacy slugs, or matching image and size.
3. Valid records are converted to product-ID selections.
4. Invalid or unmappable records are discarded.
5. The migrated state is written back in version `2` format.

## Behavioral Notes

- Current prices, names, images, and availability always come from the product catalog.
- Corrupt storage no longer crashes the storefront.
- Saved state is not overwritten before hydration completes.
- Reducing cart quantity below one removes that cart variant.
- Standard and gift-box variants remain separate cart lines.

## Phase Boundary

Razorpay checkout was moved behind server-created and server-verified orders in Phase 3. See `PHASE_3_MIGRATION.md`.
