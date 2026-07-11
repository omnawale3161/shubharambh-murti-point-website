import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { defaultProductCollections } from "@/lib/products/categories";
import type { Database } from "@/lib/supabase/database.types";
import { slugify } from "./validation";

type AdminSupabaseClient = SupabaseClient<Database>;

export async function ensureDefaultCategories(supabase: AdminSupabaseClient) {
  const seeds = defaultProductCollections.map((name, index) => ({
    name,
    slug: slugify(name),
    description: "",
    sort_order: index,
    is_active: true
  }));

  await supabase.from("categories").upsert(seeds, {
    onConflict: "slug",
    ignoreDuplicates: true
  });
}

export async function listAdminCategories(supabase: AdminSupabaseClient) {
  const first = await supabase.from("categories").select("*").order("sort_order");
  if (first.error || first.data?.length) return first;

  await ensureDefaultCategories(supabase);
  return supabase.from("categories").select("*").order("sort_order");
}
