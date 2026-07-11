import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { defaultProductCollections, primaryProductCategorySeeds } from "@/lib/products/categories";
import type { Database } from "@/lib/supabase/database.types";

type AdminSupabaseClient = SupabaseClient<Database>;

export async function ensureDefaultCategories(supabase: AdminSupabaseClient) {
  const seeds = primaryProductCategorySeeds.map((category, index) => ({
    name: category.name,
    slug: category.slug,
    description: "",
    image_url: null,
    sort_order: index,
    is_active: true
  }));

  await supabase.from("categories").upsert(seeds, {
    onConflict: "slug",
    ignoreDuplicates: true
  });
}

export async function listAdminCategories(supabase: AdminSupabaseClient) {
  await ensureDefaultCategories(supabase);
  const first = await supabase
    .from("categories")
    .select("*")
    .in("name", [...defaultProductCollections])
    .order("sort_order");
  if (first.error || first.data?.length) return first;

  return first;
}
