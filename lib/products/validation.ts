import { isValidProductId, isValidProductSlug } from "./slug";
import { Product, ProductCollection } from "./types";

export function validateProductCatalog(
  catalog: Product[],
  collections: readonly ProductCollection[]
): readonly Product[] {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const knownCollections = new Set<ProductCollection>(collections);

  catalog.forEach((product, index) => {
    const location = `Product record ${index + 1}`;

    if (!isValidProductId(product.id) || ids.has(product.id)) {
      throw new Error(`${location} has an invalid or duplicate id: ${product.id}`);
    }

    if (!isValidProductSlug(product.slug) || slugs.has(product.slug)) {
      throw new Error(`${location} has an invalid or duplicate slug: ${product.slug}`);
    }

    if (!product.name.trim() || !product.size.trim() || !product.material.trim() || !product.description.trim()) {
      throw new Error(`${location} contains an empty required field.`);
    }

    if (!knownCollections.has(product.collection)) {
      throw new Error(`${location} uses an unknown collection: ${product.collection}`);
    }

    if (!Number.isFinite(product.price) || product.price <= 0) {
      throw new Error(`${location} has an invalid price: ${product.price}`);
    }

    if (!product.image.startsWith("/assets/")) {
      throw new Error(`${location} has an invalid image path: ${product.image}`);
    }

    ids.add(product.id);
    slugs.add(product.slug);
  });

  return Object.freeze(catalog.map((product) => Object.freeze({ ...product })));
}
