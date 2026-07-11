import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { collections, getProductById, getProductBySlug, products } from "./catalog";
import { databaseStorefrontProducts, type StorefrontProductRow } from "./storefront-merge";

async function databaseProductRows() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("id,category_id,name,slug,description,price_paise,stock_count,sku,image_url,material,size,badge,is_active,categories(name,slug)")
      .order("created_at", { ascending: false });

    if (error) return null;
    return data.map((row) => row as unknown as StorefrontProductRow);
  } catch {
    return null;
  }
}

export async function getStorefrontProducts() {
  const database = await databaseProductRows();
  return database === null ? products : databaseStorefrontProducts(database);
}

export async function getStorefrontCollections() {
  const storeProducts = await getStorefrontProducts();
  const productCollections = storeProducts.map((product) => product.collection).filter(Boolean);
  return [...new Set([...collections, ...productCollections])];
}

export async function getStorefrontProductById(id: string) {
  const storefrontProducts = await getStorefrontProducts();
  return storefrontProducts.find((product) => product.id === id) ?? getProductById(id);
}

export async function getStorefrontProductBySlug(slug: string) {
  const storefrontProducts = await getStorefrontProducts();
  return storefrontProducts.find((product) => product.slug === slug) ?? getProductBySlug(slug);
}
