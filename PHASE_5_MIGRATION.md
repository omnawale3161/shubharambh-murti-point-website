# Phase 5 Migration Notes

## Production Domain

SEO artifacts use this canonical domain:

```text
https://shubharambhmurti.com
```

Confirm that the Vercel production domain redirects consistently to this hostname.

## Google Search Console

After deployment:

1. Verify ownership of `shubharambhmurti.com`.
2. Submit `https://shubharambhmurti.com/sitemap.xml`.
3. Inspect the homepage, collections page, and representative product URLs.
4. Monitor indexing, canonical selection, product rich results, and structured-data warnings.

## Generated Endpoints

```text
/robots.txt
/sitemap.xml
```

The sitemap includes all public informational pages and stable product URLs. Private customer workflow routes are excluded and marked `noindex`.

## Structured Data

The site emits:

- `Store` and `LocalBusiness`
- `WebSite`
- `Product`
- `BreadcrumbList`

No street address or opening hours were added because verified values are not currently available. Add those values only after the business confirms them.

## Product Catalog Rules

Stable product IDs, slugs, prices, descriptions, and images directly affect metadata, sitemap entries, and Product schema. Catalog changes should be reviewed as SEO changes.

## Phase Boundary

Image optimization, lazy loading, client bundle reduction, font optimization, and caching strategy remain deferred to Phase 6.
