import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { StockMovement } from "@/lib/supabase/database.types";
import { inventoryAvailability } from "./domain";
export { inventoryAvailability, salesReport } from "./domain";
export type { InventoryAvailability } from "./domain";

export async function getInventoryBySlug(slug: string) {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("products").select("stock,reserved_stock,low_stock_threshold").eq("slug", slug).eq("is_active", true).maybeSingle();
    if (error || !data) return null;
    return inventoryAvailability(data);
  } catch {
    return null;
  }
}

export async function getInventoryMap() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("products").select("slug,stock,reserved_stock,low_stock_threshold").eq("is_active", true);
    if (error || !data) return {};
    return Object.fromEntries(data.map((product) => [product.slug, inventoryAvailability(product)]));
  } catch {
    return {};
  }
}

export type { StockMovement };
