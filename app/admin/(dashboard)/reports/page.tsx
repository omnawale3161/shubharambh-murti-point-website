import { requireAdmin } from "@/lib/backend/auth";
import { inventoryAvailability, salesReport } from "@/lib/inventory";
import { getOrderPersistenceConfig, listOrders } from "@/lib/payments";
import { formatPrice } from "@/lib/products";

export default async function AdminReportsPage() {
  const { supabase } = await requireAdmin();
  const [orders, products] = await Promise.all([
    listOrders(getOrderPersistenceConfig()),
    supabase.from("products").select("id,name,sku,stock,reserved_stock,low_stock_threshold").order("name")
  ]);
  const report = salesReport(orders);
  const inventory = products.data || [];

  return <><p className="section-kicker">Business Intelligence</p><h1 className="mt-2 text-4xl">Reports</h1>
    <div className="mt-8 grid gap-6 xl:grid-cols-2">
      <section className="rounded-lg border border-outline-variant bg-white p-5"><h2 className="text-2xl font-bold">Best selling products</h2><div className="mt-4 grid gap-3">{report.bestSellers.slice(0, 10).map((item) => <div key={item.name} className="flex justify-between gap-3 border-t border-outline-variant pt-3"><span><strong className="block">{item.name}</strong><span className="text-sm text-on-surface-variant">{item.quantity} sold</span></span><strong>{formatPrice(item.revenuePaise / 100)}</strong></div>)}{!report.bestSellers.length ? <p>No paid order data yet.</p> : null}</div></section>
      <section className="rounded-lg border border-outline-variant bg-white p-5"><h2 className="text-2xl font-bold">Revenue by month</h2><div className="mt-4 grid gap-3">{report.monthlyRevenue.slice(0, 12).map(([month, paise]) => <div key={month} className="flex justify-between border-t border-outline-variant pt-3"><span>{month}</span><strong>{formatPrice(paise / 100)}</strong></div>)}{!report.monthlyRevenue.length ? <p>No paid order data yet.</p> : null}</div></section>
      <section className="rounded-lg border border-outline-variant bg-white p-5"><h2 className="text-2xl font-bold">Revenue by day</h2><div className="mt-4 grid gap-3">{report.dailyRevenue.slice(0, 14).map(([day, paise]) => <div key={day} className="flex justify-between border-t border-outline-variant pt-3"><span>{day}</span><strong>{formatPrice(paise / 100)}</strong></div>)}{!report.dailyRevenue.length ? <p>No paid order data yet.</p> : null}</div></section>
      <section className="rounded-lg border border-outline-variant bg-white p-5"><h2 className="text-2xl font-bold">Low stock report</h2><div className="mt-4 grid gap-3">{inventory.filter((product) => { const state = inventoryAvailability(product); return state.isLowStock || state.isOutOfStock; }).map((product) => { const state = inventoryAvailability(product); return <div key={product.id} className="flex justify-between border-t border-outline-variant pt-3"><span><strong className="block">{product.name}</strong><span className="font-mono text-xs text-on-surface-variant">{product.sku || "SKU missing"}</span></span><strong className={state.isOutOfStock ? "text-red-700" : "text-amber-700"}>{state.availableStock} available</strong></div>; })}</div></section>
    </div></>;
}
