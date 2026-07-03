import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/backend/auth";

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");
  return <><p className="section-kicker">Catalog</p><h1 className="mt-2 text-4xl">Add product</h1><section className="mt-8 rounded-lg border border-outline-variant bg-white p-5"><ProductForm categories={categories || []} /></section></>;
}

