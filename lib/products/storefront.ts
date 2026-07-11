import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isPrimaryProductCategoryName } from "./categories";
import {
  databaseStorefrontProducts,
  type StorefrontCategoryRow,
  type StorefrontProductRow
} from "./storefront-merge";

type StorefrontProductDatabaseRow = Omit<StorefrontProductRow, "categories">;

export type StorefrontCategoryTile = {
  category: StorefrontCategoryRow;
  image: string;
  product: Awaited<ReturnType<typeof getStorefrontProducts>>[number];
};

const fallbackCategoryImage = "/assets/logo.png";

async function databaseProductRows() {
  try {
    const supabase = await createSupabaseServerClient();
    const [productsResult, categoriesResult] = await Promise.all([
      supabase
        .from("products")
        .select("id,category_id,name,slug,description,price_paise,stock_count,sku,image_url,material,size,badge,is_active")
        .order("created_at", { ascending: false }),
      supabase
        .from("categories")
        .select("id,name,slug,description,image_url,is_active,sort_order")
        .order("sort_order")
    ]);

    if (productsResult.error || categoriesResult.error) return null;
    const categoryById = new Map(
      (categoriesResult.data || []).map((category) => [
        category.id,
        category as unknown as StorefrontCategoryRow
      ])
    );

    return (productsResult.data || []).map((row) => {
      const product = row as unknown as StorefrontProductDatabaseRow;
      return {
        ...product,
        categories: product.category_id ? categoryById.get(product.category_id) || null : null
      } satisfies StorefrontProductRow;
    });
  } catch {
    return null;
  }
}

export async function getStorefrontProducts() {
  const database = await databaseProductRows();
  // Catalog fallback is intentionally disabled while admin/database products are the source of truth.
  return database === null ? [] : databaseStorefrontProducts(database);
}

export async function getStorefrontCollections() {
  const storeProducts = await getStorefrontProducts();
  const productCollections = storeProducts
    .map((product) => product.collection)
    .filter((collection) => collection && isPrimaryProductCategoryName(collection));
  return [...new Set(productCollections)];
}

export async function getStorefrontCategoryTiles() {
  const database = await databaseProductRows();
  if (database === null) return [];

  const products = databaseStorefrontProducts(database);
  const productByCategory = new Map(products.map((product) => [product.collection, product]));
  const categoryByName = new Map<string, StorefrontCategoryRow>();

  database.forEach((row) => {
    const category = row.categories;
    if (category?.is_active && isPrimaryProductCategoryName(category.name)) {
      categoryByName.set(category.name, category);
    }
  });

  return [...categoryByName.values()]
    .sort((first, second) => first.sort_order - second.sort_order)
    .flatMap((category) => {
      const product = productByCategory.get(category.name);
      if (!product) return [];

      return [{
        category,
        image: category.image_url || product.image || fallbackCategoryImage,
        product
      }];
    });
}

export async function getStorefrontProductById(id: string) {
  const storefrontProducts = await getStorefrontProducts();
  // No catalog fallback: missing DB products should appear unavailable during admin testing.
  return storefrontProducts.find((product) => product.id === id);
}

export async function getStorefrontProductBySlug(slug: string) {
  const storefrontProducts = await getStorefrontProducts();
  // No catalog fallback: missing DB products should 404 instead of reading stale catalog data.
  return storefrontProducts.find((product) => product.slug === slug);
}
