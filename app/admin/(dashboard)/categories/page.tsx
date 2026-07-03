import { deleteCategoryAction } from "@/app/admin/actions";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { requireAdmin } from "@/lib/backend/auth";

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();
  const { data: categories, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;
  return <><p className="section-kicker">Catalog</p><h1 className="mt-2 text-4xl">Categories</h1><div className="mt-8 grid gap-5 lg:grid-cols-2"><CategoryForm />{categories?.map((category) => <div key={category.id}><CategoryForm category={category} /><form action={deleteCategoryAction} className="mt-2"><input type="hidden" name="id" value={category.id} /><button className="text-sm font-bold text-red-800">Delete category</button></form></div>)}</div></>;
}

