import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { products as catalogProducts } from "@/lib/products";
import { primaryProductCategorySeeds } from "@/lib/products/categories";
import type { Database } from "@/lib/supabase/database.types";

type AdminSupabaseClient = SupabaseClient<Database>;
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

async function ensureCatalogCategories(supabase: AdminSupabaseClient) {
  const seeds = primaryProductCategorySeeds.map((category, index) => ({
    name: category.name,
    slug: category.slug,
    description: "",
    image_url: null,
    sort_order: index,
    is_active: true
  }));

  const { error } = await supabase.from("categories").upsert(seeds, {
    onConflict: "slug",
    ignoreDuplicates: true
  });
  if (error) throw error;

  const categories = await supabase.from("categories").select("id,name,slug").order("sort_order");
  if (categories.error) throw categories.error;

  return new Map((categories.data || []).map((category) => [category.name, category.id]));
}

function catalogProductInput(product: typeof catalogProducts[number], categoryId: string | null): ProductInsert {
  const stock = 25;

  return {
    name: product.name.trim(),
    slug: product.slug,
    category_id: categoryId,
    description: product.description,
    price_paise: Math.round(product.price * 100),
    compare_at_price_paise: null,
    stock_count: stock,
    stock,
    reserved_stock: 0,
    low_stock_threshold: 5,
    sku: product.id,
    image_url: product.image,
    image_urls: product.images || [],
    image_path: null,
    material: product.material,
    size: product.size,
    badge: product.badge,
    is_active: true,
    is_featured: product.badge.toLowerCase().includes("best")
  };
}

function catalogProductUpdate(input: ProductInsert): ProductUpdate {
  return {
    category_id: input.category_id,
    name: input.name,
    slug: input.slug,
    description: input.description,
    price_paise: input.price_paise,
    compare_at_price_paise: input.compare_at_price_paise,
    stock_count: input.stock_count,
    stock: input.stock,
    reserved_stock: input.reserved_stock,
    low_stock_threshold: input.low_stock_threshold,
    sku: input.sku,
    image_url: input.image_url,
    image_urls: input.image_urls,
    image_path: input.image_path,
    material: input.material,
    size: input.size,
    badge: input.badge,
    is_active: input.is_active,
    is_featured: input.is_featured
  };
}

export async function syncCatalogProductsToDatabase(
  supabase: AdminSupabaseClient,
  { overwriteExisting = false }: { overwriteExisting?: boolean } = {}
) {
  const categoryIdByName = await ensureCatalogCategories(supabase);
  const existingResult = await supabase.from("products").select("id,sku,slug");
  if (existingResult.error) throw existingResult.error;

  const existingBySku = new Map((existingResult.data || []).flatMap((product) => product.sku ? [[product.sku, product]] : []));
  const existingBySlug = new Map((existingResult.data || []).map((product) => [product.slug, product]));
  let inserted = 0;
  let updated = 0;

  for (const product of catalogProducts) {
    const input = catalogProductInput(product, categoryIdByName.get(product.collection) || null);
    const existing = existingBySku.get(product.id) || existingBySlug.get(product.slug);

    if (existing) {
      if (!overwriteExisting) continue;

      const { error } = await supabase.from("products").update(catalogProductUpdate(input)).eq("id", existing.id);
      if (error) throw error;
      updated += 1;
      continue;
    }

    const { error } = await supabase.from("products").insert(input);
    if (error) throw error;
    inserted += 1;
  }

  return { inserted, updated, total: catalogProducts.length };
}
