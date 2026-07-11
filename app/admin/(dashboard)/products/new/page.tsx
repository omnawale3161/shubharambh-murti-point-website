import { ProductForm } from "@/components/admin/ProductForm";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { requireAdmin } from "@/lib/backend/auth";
import { listAdminCategories } from "@/lib/backend/categories";

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();
  const [{ data: categories }, { data: products }] = await Promise.all([
    listAdminCategories(supabase),
    supabase.from("products").select("slug")
  ]);
  return (
    <>
      <AdminPageHeader kicker="Catalog" title="Add product" description="Create a premium product listing with pricing, stock, media, and storefront visibility." />
      <div className="mt-8"><ProductForm categories={categories || []} existingSlugs={(products || []).map((product) => product.slug)} /></div>
    </>
  );
}
