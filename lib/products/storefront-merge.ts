import type { Product, ProductCollection } from "./types";
import { isPrimaryProductCategoryName } from "./categories";

export type StorefrontProductRow = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string;
  price_paise: number;
  stock_count: number;
  sku: string | null;
  image_url: string | null;
  material: string;
  size: string;
  badge: string | null;
  is_active: boolean;
  categories: StorefrontCategoryRow | null;
};

export type StorefrontCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
};

const fallbackImage = "/assets/logo.png";

function fromDatabaseProduct(row: StorefrontProductRow, base?: Product): Product {
  return {
    id: base?.id || row.sku || row.id,
    slug: row.slug || base?.slug || row.id,
    name: row.name || base?.name || "Product",
    collection: (row.categories?.name || base?.collection || "Uncategorized") as ProductCollection,
    price: row.price_paise / 100,
    size: row.size || base?.size || "Size not specified",
    material: row.material || base?.material || "Material not specified",
    image: row.image_url || base?.image || fallbackImage,
    badge: row.badge || base?.badge || "New",
    description:
      row.description ||
      base?.description ||
      "Premium devotional product from Shubharambh Murti Point."
  };
}

export function databaseStorefrontProducts(databaseProducts: readonly StorefrontProductRow[]) {
  return databaseProducts
    .filter((row) => row.is_active && row.categories?.is_active && isPrimaryProductCategoryName(row.categories.name))
    .map((row) => fromDatabaseProduct(row));
}

export function mergeStorefrontProducts(
  catalogProducts: readonly Product[],
  databaseProducts: readonly StorefrontProductRow[] | null
) {
  if (!databaseProducts?.length) return [...catalogProducts];

  const merged = new Map(catalogProducts.map((product) => [product.id, product]));

  databaseProducts.forEach((row) => {
    const base =
      (row.sku ? merged.get(row.sku) : undefined) ??
      catalogProducts.find((product) => product.slug === row.slug);
    const productId = base?.id || row.sku || row.id;

    if (!row.is_active) {
      if (base) merged.delete(productId);
      return;
    }

    merged.set(productId, fromDatabaseProduct(row, base));
  });

  return [...merged.values()];
}
