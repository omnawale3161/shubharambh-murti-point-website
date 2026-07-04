import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { requireAdmin } from "@/lib/backend/auth";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const [{ data: product }, { data: categories }] = await Promise.all([supabase.from("products").select("*").eq("id", id).single(), supabase.from("categories").select("*").order("sort_order")]);
  if (!product) notFound();
  return (
    <>
      <AdminPageHeader kicker="Catalog" title="Edit product" description="Update product details while preserving existing inventory and storefront behavior." />
      <div className="mt-8"><ProductForm product={product} categories={categories || []} /></div>
    </>
  );
}
