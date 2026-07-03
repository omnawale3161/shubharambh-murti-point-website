const legacyUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const productIdPattern = /^smp-\d{3}$/;
const productSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isLegacyUuidSlug(slug: string) {
  return legacyUuidPattern.test(slug);
}

export function isValidProductId(id: string) {
  return productIdPattern.test(id);
}

export function isValidProductSlug(slug: string) {
  return productSlugPattern.test(slug);
}

export function productPath(slug: string) {
  return `/products/${slug}`;
}
