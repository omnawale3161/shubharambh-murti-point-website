import { Trash2 } from "lucide-react";
import { deleteCategoryAction } from "@/app/admin/actions";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { AdminEmptyState, AdminPageHeader } from "@/components/admin/AdminUI";
import { requireAdmin } from "@/lib/backend/auth";

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();
  const { data: categories, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;

  return (
    <>
      <AdminPageHeader kicker="Catalog" title="Categories" description="Create and order storefront categories without changing public navigation behavior." />
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <CategoryForm />
        {categories?.map((category) => (
          <div key={category.id} className="grid gap-2">
            <CategoryForm category={category} />
            <form action={deleteCategoryAction}>
              <input type="hidden" name="id" value={category.id} />
              <button className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-black text-red-700 transition hover:bg-red-50"><Trash2 size={16} />Delete category</button>
            </form>
          </div>
        ))}
      </div>
      {!categories?.length ? <div className="mt-6"><AdminEmptyState title="No categories yet" description="Create categories to group products for browsing and product management." /></div> : null}
    </>
  );
}
