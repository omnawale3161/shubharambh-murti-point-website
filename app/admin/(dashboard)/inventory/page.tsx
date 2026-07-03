import Link from "next/link";
import { AlertTriangle, History, PackageCheck, PackageX } from "lucide-react";
import { bulkUpdateStockAction } from "@/app/admin/actions";
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

  return <><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="section-kicker">Stock Control</p><h1 className="mt-2 text-4xl">Inventory</h1></div><Link href="/admin/reports" className="rounded-lg border border-primary px-4 py-2 font-bold text-primary">View reports</Link></div>
    <form className="mt-7 grid gap-3 rounded-lg border border-outline-variant bg-white p-4 sm:grid-cols-[1fr_180px_auto]"><input name="q" defaultValue={q} placeholder="Search product or SKU" className="rounded-lg border border-outline-variant px-3 py-2" /><select name="status" defaultValue={status} className="rounded-lg border border-outline-variant px-3 py-2"><option value="all">All stock</option><option value="healthy">Healthy</option><option value="low">Low stock</option><option value="out">Out of stock</option></select><button className="rounded-lg bg-primary px-5 py-2 font-bold text-white">Filter</button></form>
    <form action={bulkUpdateStockAction} className="mt-6 overflow-auto rounded-lg border border-outline-variant bg-white"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-surface-container"><tr><th className="p-3">Product</th><th className="p-3">Available</th><th className="p-3">Reserved</th><th className="p-3">Threshold</th><th className="p-3">New stock</th><th className="p-3">Status</th></tr></thead><tbody>{filtered.map((product) => { const inventory = inventoryAvailability(product); return <tr key={product.id} className="border-t border-outline-variant"><td className="p-3"><p className="font-bold">{product.name}</p><p className="font-mono text-xs text-on-surface-variant">{product.sku || "SKU missing"}</p></td><td className="p-3 font-bold">{inventory.availableStock}</td><td className="p-3">{product.reserved_stock}</td><td className="p-3">{product.low_stock_threshold}</td><td className="p-3"><input aria-label={`Stock for ${product.name}`} name={`stock_${product.id}`} type="number" min="0" defaultValue={product.stock} className="w-24 rounded-lg border border-outline-variant px-3 py-2" /></td><td className="p-3">{inventory.isOutOfStock ? <span className="inline-flex items-center gap-1 font-bold text-red-700"><PackageX size={16} />Out of stock</span> : inventory.isLowStock ? <span className="inline-flex items-center gap-1 font-bold text-amber-700"><AlertTriangle size={16} />Low stock</span> : <span className="inline-flex items-center gap-1 font-bold text-green-700"><PackageCheck size={16} />Healthy</span>}</td></tr>; })}</tbody></table><div className="border-t border-outline-variant p-4"><button className="rounded-lg bg-primary px-5 py-3 font-bold text-white">Save bulk stock update</button></div></form>
    <section className="mt-8 rounded-lg border border-outline-variant bg-white p-5"><h2 className="flex items-center gap-2 text-2xl font-bold"><History size={22} />Stock movement history</h2><div className="mt-4 grid gap-3">{movements?.length ? movements.map((movement) => <div key={movement.id} className="grid gap-1 border-t border-outline-variant pt-3 text-sm sm:grid-cols-[1fr_auto]"><div><p className="font-bold">{movement.movement_type.replaceAll("_", " ")}</p><p className="text-on-surface-variant">{movement.note || "Inventory movement"}{movement.order_id ? ` · Order ${movement.order_id}` : ""}</p></div><p className={`font-bold ${movement.quantity > 0 ? "text-green-700" : "text-red-700"}`}>{movement.quantity > 0 ? "+" : ""}{movement.quantity} · Stock {movement.stock_after} · Reserved {movement.reserved_after}</p></div>) : <p>No stock movements yet.</p>}</div></section>
    </>;
}
