import Link from "next/link";
import { AlertTriangle, History, PackageCheck, PackageX, Search, Save } from "lucide-react";
import { bulkUpdateStockAction } from "@/app/admin/actions";
import { AdminCard, AdminEmptyState, AdminPageHeader, AdminStatusBadge, AdminTableShell } from "@/components/admin/AdminUI";
import { requireAdmin } from "@/lib/backend/auth";
import { inventoryAvailability } from "@/lib/inventory";

export default async function AdminInventoryPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { supabase } = await requireAdmin();
  const { q = "", status = "all" } = await searchParams;
  const [{ data: products, error }, { data: movements }] = await Promise.all([
    supabase.from("products").select("id,name,slug,sku,stock,stock_count,reserved_stock,low_stock_threshold,is_active").order("name"),
    supabase.from("stock_movements").select("*").order("created_at", { ascending: false }).limit(30)
  ]);
  if (error) throw error;

  const filtered = (products || []).filter((product) => {
    const inventory = inventoryAvailability(product);
    const matchesQuery = !q || `${product.name} ${product.sku} ${product.slug}`.toLowerCase().includes(q.toLowerCase());
    const matchesStatus = status === "all" || (status === "low" && inventory.isLowStock) || (status === "out" && inventory.isOutOfStock) || (status === "healthy" && !inventory.isLowStock && !inventory.isOutOfStock);
    return matchesQuery && matchesStatus;
  });
  const counts = (products || []).reduce((acc, product) => {
    const inventory = inventoryAvailability(product);
    if (inventory.isOutOfStock) acc.out += 1;
    else if (inventory.isLowStock) acc.low += 1;
    else acc.healthy += 1;
    return acc;
  }, { healthy: 0, low: 0, out: 0 });

  return (
    <>
      <AdminPageHeader
        kicker="Stock Control"
        title="Inventory"
        description="Monitor live stock, low-stock alerts, reserved inventory, bulk updates, and stock movement history."
        action={<Link href="/admin/reports" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-900 transition hover:border-amber-300 hover:text-amber-700">View reports</Link>}
      />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <AdminCard><p className="text-sm font-bold text-slate-500">Healthy stock</p><p className="mt-2 text-3xl font-black text-emerald-700">{counts.healthy}</p></AdminCard>
        <AdminCard><p className="text-sm font-bold text-slate-500">Low stock alerts</p><p className="mt-2 text-3xl font-black text-amber-700">{counts.low}</p></AdminCard>
        <AdminCard><p className="text-sm font-bold text-slate-500">Out of stock</p><p className="mt-2 text-3xl font-black text-red-700">{counts.out}</p></AdminCard>
      </div>
      <form className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:grid-cols-[1fr_190px_auto]">
        <label className="relative">
          <span className="sr-only">Search inventory</span>
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input name="q" defaultValue={q} placeholder="Search product or SKU" className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" />
        </label>
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10">
          <option value="all">All stock</option>
          <option value="healthy">Healthy</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
        <button className="h-11 rounded-xl bg-amber-600 px-5 text-sm font-black text-white shadow-lg shadow-amber-600/20 transition hover:bg-amber-700">Filter</button>
      </form>
      <form action={bulkUpdateStockAction} className="mt-8">
        <AdminTableShell>
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
              <tr><th className="px-5 py-4">Product</th><th className="px-5 py-4">Available</th><th className="px-5 py-4">Reserved</th><th className="px-5 py-4">Threshold</th><th className="px-5 py-4">New stock</th><th className="px-5 py-4">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((product) => {
                const inventory = inventoryAvailability(product);
                return (
                  <tr key={product.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4"><p className="font-black text-slate-950">{product.name}</p><p className="mt-1 font-mono text-xs text-slate-500">{product.sku || "SKU missing"}</p></td>
                    <td className="px-5 py-4 text-lg font-black text-slate-950">{inventory.availableStock}</td>
                    <td className="px-5 py-4 font-bold text-slate-700">{product.reserved_stock}</td>
                    <td className="px-5 py-4 font-bold text-slate-700">{product.low_stock_threshold}</td>
                    <td className="px-5 py-4"><input aria-label={`Stock for ${product.name}`} name={`stock_${product.id}`} type="number" min="0" defaultValue={product.stock} className="h-10 w-28 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" /></td>
                    <td className="px-5 py-4">{inventory.isOutOfStock ? <AdminStatusBadge tone="red"><PackageX size={14} className="mr-1" />Out of stock</AdminStatusBadge> : inventory.isLowStock ? <AdminStatusBadge tone="amber"><AlertTriangle size={14} className="mr-1" />Low stock</AdminStatusBadge> : <AdminStatusBadge tone="green"><PackageCheck size={14} className="mr-1" />Healthy</AdminStatusBadge>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!filtered.length ? <div className="p-5"><AdminEmptyState title="No matching stock records" description="Try changing the search term or stock filter." /></div> : null}
          <div className="border-t border-slate-100 p-4">
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 text-sm font-black text-white shadow-lg shadow-amber-600/20 transition hover:bg-amber-700"><Save size={17} />Save bulk stock update</button>
          </div>
        </AdminTableShell>
      </form>
      <AdminCard className="mt-8">
        <h2 className="flex items-center gap-2 text-xl font-black text-slate-950"><History size={21} />Stock movement history</h2>
        <div className="mt-5 grid gap-3">
          {movements?.length ? movements.map((movement) => (
            <div key={movement.id} className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-sm sm:grid-cols-[1fr_auto]">
              <div><p className="font-black capitalize text-slate-950">{movement.movement_type.replaceAll("_", " ")}</p><p className="mt-1 text-slate-500">{movement.note || "Inventory movement"}{movement.order_id ? ` · Order ${movement.order_id}` : ""}</p></div>
              <p className={`font-black ${movement.quantity > 0 ? "text-emerald-700" : "text-red-700"}`}>{movement.quantity > 0 ? "+" : ""}{movement.quantity} · Stock {movement.stock_after} · Reserved {movement.reserved_after}</p>
            </div>
          )) : <AdminEmptyState title="No stock movements yet" description="Manual adjustments, reservations, and sales movements will appear here." />}
        </div>
      </AdminCard>
    </>
  );
}
