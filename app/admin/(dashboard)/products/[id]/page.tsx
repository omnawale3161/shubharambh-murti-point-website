import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { requireAdmin } from "@/lib/backend/auth";
import { listAdminCategories } from "@/lib/backend/categories";
import { products as catalogProducts } from "@/lib/products";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const [{ data: product }, { data: categories }, { data: products }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    listAdminCategories(supabase),
    supabase.from("products").select("id,slug")
  ]);
  if (!product) notFound();
  return (
    <>
      <AdminPageHeader kicker="Catalog" title="Edit product" description="Update product details while preserving existing inventory and storefront behavior." />
      <div className="mt-8"><ProductForm product={product} categories={categories || []} existingSlugs={[...(products || []).filter((item) => item.id !== product.id).map((item) => item.slug), ...catalogProducts.filter((item) => item.id !== product.sku).map((item) => item.slug)]} /></div>
    </>
  );
}
