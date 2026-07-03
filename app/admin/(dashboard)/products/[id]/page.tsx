import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/backend/auth";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const [{ data: product }, { data: categories }] = await Promise.all([supabase.from("products").select("*").eq("id", id).single(), supabase.from("categories").select("*").order("sort_order")]);
  if (!product) notFound();
  return <><p className="section-kicker">Catalog</p><h1 className="mt-2 text-4xl">Edit product</h1><section className="mt-8 rounded-lg border border-outline-variant bg-white p-5"><ProductForm product={product} categories={categories || []} /></section></>;
}

