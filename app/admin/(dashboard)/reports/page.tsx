import { AdminCard, AdminEmptyState, AdminPageHeader, AdminStatusBadge } from "@/components/admin/AdminUI";
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
  const monthly = report.monthlyRevenue.slice(0, 12);
  const maxMonth = Math.max(...monthly.map(([, paise]) => paise), 1);
  const paidOrders = orders.filter((order) => ["paid", "confirmed", "packed", "shipped", "delivered"].includes(order.status));
  const totalRevenuePaise = paidOrders.reduce((sum, order) => sum + order.amount_paise, 0);
  const visitors = "Connect analytics";

  return (
    <>
      <AdminPageHeader kicker="Business Intelligence" title="Analytics" description="Revenue, sales, visitors, best sellers, and low-stock signals for admin decisions." />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <AdminCard><p className="text-sm font-bold text-slate-500">Revenue</p><p className="mt-2 text-3xl font-black text-slate-950">{formatPrice(totalRevenuePaise / 100)}</p></AdminCard>
        <AdminCard><p className="text-sm font-bold text-slate-500">Paid orders</p><p className="mt-2 text-3xl font-black text-emerald-700">{paidOrders.length}</p></AdminCard>
        <AdminCard><p className="text-sm font-bold text-slate-500">Best sellers</p><p className="mt-2 text-3xl font-black text-amber-700">{report.bestSellers.length}</p></AdminCard>
        <AdminCard><p className="text-sm font-bold text-slate-500">Visitors</p><p className="mt-2 text-xl font-black text-slate-950">{visitors}</p></AdminCard>
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <AdminCard>
          <h2 className="text-xl font-black text-slate-950">Revenue by month</h2>
          {monthly.length ? (
            <div className="mt-6 grid gap-4">
              {monthly.map(([month, paise]) => (
                <div key={month} className="grid gap-2">
                  <div className="flex justify-between gap-4 text-sm"><span className="font-black text-slate-700">{month}</span><strong className="text-slate-950">{formatPrice(paise / 100)}</strong></div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-amber-700 to-amber-400" style={{ width: `${Math.max((paise / maxMonth) * 100, 4)}%` }} /></div>
                </div>
              ))}
            </div>
          ) : <div className="mt-5"><AdminEmptyState title="No revenue yet" description="Monthly revenue appears after paid orders are recorded." /></div>}
        </AdminCard>
        <AdminCard>
          <h2 className="text-xl font-black text-slate-950">Top selling products</h2>
          <div className="mt-5 grid gap-3">
            {report.bestSellers.slice(0, 10).map((item, index) => (
              <div key={item.name} className="flex justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <span className="min-w-0"><strong className="block truncate text-slate-950">{index + 1}. {item.name}</strong><span className="text-sm text-slate-500">{item.quantity} sold</span></span>
                <strong className="shrink-0 text-amber-700">{formatPrice(item.revenuePaise / 100)}</strong>
              </div>
            ))}
            {!report.bestSellers.length ? <AdminEmptyState title="No best sellers yet" description="Best sellers are calculated from paid order items." /> : null}
          </div>
        </AdminCard>
        <AdminCard>
          <h2 className="text-xl font-black text-slate-950">Revenue by day</h2>
          <div className="mt-5 grid gap-3">
            {report.dailyRevenue.slice(0, 14).map(([day, paise]) => (
              <div key={day} className="flex justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-4"><span className="font-bold text-slate-700">{day}</span><strong>{formatPrice(paise / 100)}</strong></div>
            ))}
            {!report.dailyRevenue.length ? <AdminEmptyState title="No daily revenue yet" description="Daily sales data appears when paid orders are available." /> : null}
          </div>
        </AdminCard>
        <AdminCard>
          <h2 className="text-xl font-black text-slate-950">Low stock report</h2>
          <div className="mt-5 grid gap-3">
            {inventory.filter((product) => {
              const state = inventoryAvailability(product);
              return state.isLowStock || state.isOutOfStock;
            }).map((product) => {
              const state = inventoryAvailability(product);
              return (
                <div key={product.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <span className="min-w-0"><strong className="block truncate text-slate-950">{product.name}</strong><span className="font-mono text-xs text-slate-500">{product.sku || "SKU missing"}</span></span>
                  <AdminStatusBadge tone={state.isOutOfStock ? "red" : "amber"}>{state.availableStock} available</AdminStatusBadge>
                </div>
              );
            })}
            {!inventory.some((product) => {
              const state = inventoryAvailability(product);
              return state.isLowStock || state.isOutOfStock;
            }) ? <AdminEmptyState title="Stock is healthy" description="No low-stock or out-of-stock products need attention." /> : null}
          </div>
        </AdminCard>
      </div>
    </>
  );
}
