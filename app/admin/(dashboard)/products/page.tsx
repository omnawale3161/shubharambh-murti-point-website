import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, DatabaseZap, Eye, PackageCheck, PackageX, Pencil, Plus, Trash2, UploadCloud } from "lucide-react";
import { deleteProductAction, syncCatalogProductsAction } from "@/app/admin/actions";
import { AdminCard, AdminEmptyState, AdminPageHeader, AdminStatusBadge, AdminTableShell } from "@/components/admin/AdminUI";
import { ImageUploadForm } from "@/components/admin/ImageUploadForm";
import { requireAdmin } from "@/lib/backend/auth";
import { syncCatalogProductsToDatabase } from "@/lib/backend/catalog-sync";
import { inventoryAvailability } from "@/lib/inventory";
import { formatPrice } from "@/lib/products";

export default async function AdminProductsPage() {
  const { supabase } = await requireAdmin();
  await syncCatalogProductsToDatabase(supabase);
  const { data: products, error } = await supabase
    .from("products")
    .select("id,name,slug,sku,price_paise,compare_at_price_paise,stock,reserved_stock,low_stock_threshold,is_active,is_featured,badge,image_url")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  const active = products?.filter((product) => product.is_active).length || 0;
  const lowStock = products?.filter((product) => {
    const inventory = inventoryAvailability(product);
    return inventory.isLowStock || inventory.isOutOfStock;
  }).length || 0;

  return (
    <>
      <AdminPageHeader
        kicker="Catalog"
        title="Products"
        description="Manage product previews, pricing, stock, badges, featured status, and active availability."
        action={
          <div className="flex flex-wrap gap-2">
            <form action={syncCatalogProductsAction}>
              <button className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"><DatabaseZap size={17} />Sync catalog</button>
            </form>
            <Link href="/admin/inventory" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-900 transition hover:border-amber-300 hover:text-amber-700">Manage inventory</Link>
            <Link href="/admin/products/new" className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-amber-600/20 transition hover:bg-amber-700"><Plus size={17} />Add product</Link>
          </div>
        }
      />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <AdminCard><p className="text-sm font-bold text-slate-500">Total products</p><p className="mt-2 text-3xl font-black text-slate-950">{products?.length || 0}</p></AdminCard>
        <AdminCard><p className="text-sm font-bold text-slate-500">Active products</p><p className="mt-2 text-3xl font-black text-emerald-700">{active}</p></AdminCard>
        <AdminCard><p className="text-sm font-bold text-slate-500">Stock alerts</p><p className="mt-2 text-3xl font-black text-amber-700">{lowStock}</p></AdminCard>
      </div>
      <div className="mt-8">
        <AdminTableShell>
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Product Preview</th>
                <th className="px-5 py-4">SKU</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Stock</th>
                <th className="px-5 py-4">Flags</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products?.map((product) => {
                const inventory = inventoryAvailability(product);
                const discount = product.compare_at_price_paise && product.compare_at_price_paise > product.price_paise
                  ? Math.round(((product.compare_at_price_paise - product.price_paise) / product.compare_at_price_paise) * 100)
                  : 0;

                return (
                  <tr key={product.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                          {product.image_url ? <Image src={product.image_url} alt={product.name} fill sizes="64px" className="object-contain p-1" /> : <UploadCloud size={22} className="text-slate-400" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-black text-slate-950">{product.name}</p>
                          <p className="mt-1 truncate text-xs font-semibold text-slate-500">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-black text-slate-600">{product.sku || <span className="text-red-700">Missing</span>}</td>
                    <td className="px-5 py-4">
                      <p className="font-black text-slate-950">{formatPrice(product.price_paise / 100)}</p>
                      {discount ? <p className="mt-1 text-xs font-black text-emerald-700">{discount}% discount</p> : null}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 font-black text-slate-950">
                        {inventory.isOutOfStock ? <PackageX size={16} className="text-red-700" /> : inventory.isLowStock ? <AlertTriangle size={16} className="text-amber-700" /> : <PackageCheck size={16} className="text-emerald-700" />}
                        {inventory.availableStock}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{product.reserved_stock} reserved</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {product.is_featured ? <AdminStatusBadge tone="purple">Featured</AdminStatusBadge> : null}
                        {product.badge ? <AdminStatusBadge tone="amber">{product.badge}</AdminStatusBadge> : null}
                        {!product.is_featured && !product.badge ? <span className="text-xs font-semibold text-slate-400">No flags</span> : null}
                      </div>
                    </td>
                    <td className="px-5 py-4"><AdminStatusBadge tone={product.is_active ? "green" : "slate"}>{product.is_active ? "Active" : "Inactive"}</AdminStatusBadge></td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <Link href={`/products/${product.slug}`} className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-700 transition hover:border-amber-300 hover:text-amber-700" aria-label={`Preview ${product.name}`}><Eye size={16} /></Link>
                        <Link href={`/admin/products/${product.id}`} className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-700 transition hover:border-amber-300 hover:text-amber-700" aria-label={`Edit ${product.name}`}><Pencil size={16} /></Link>
                        <form action={deleteProductAction}>
                          <input type="hidden" name="id" value={product.id} />
                          <button className="grid size-9 place-items-center rounded-lg border border-red-200 text-red-700 transition hover:bg-red-50" aria-label={`Delete ${product.name}`}><Trash2 size={16} /></button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!products?.length ? <div className="p-5"><AdminEmptyState title="No products yet" description="Create your first product to start selling from the storefront." /></div> : null}
        </AdminTableShell>
      </div>
      <div className="mt-8 max-w-3xl"><ImageUploadForm /></div>
    </>
  );
}
