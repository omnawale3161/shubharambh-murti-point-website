import { ProductForm } from "@/components/admin/ProductForm";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { requireAdmin } from "@/lib/backend/auth";

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");
  return (
    <>
      <AdminPageHeader kicker="Catalog" title="Add product" description="Create a premium product listing with pricing, stock, media, and storefront visibility." />
      <div className="mt-8"><ProductForm categories={categories || []} /></div>
    </>
  );
}
