import Link from "next/link";
import { AlertTriangle, Banknote, ClipboardList, PackageCheck, PackageX, ShoppingBag, Users } from "lucide-react";
import { AdminCard, AdminEmptyState, AdminPageHeader, AdminStatCard, AdminStatusBadge } from "@/components/admin/AdminUI";
import { requireAdmin } from "@/lib/backend/auth";
import { formatPrice } from "@/lib/products";
import { salesReport } from "@/lib/inventory";
import { orderStatusLabel, paidOrderStatuses, pendingOrderStatuses } from "@/lib/orders";
import { getOrderPersistenceConfig, listOrders } from "@/lib/payments";

export default async function AdminDashboardPage() {
  const { supabase, profile } = await requireAdmin();
  const [products, orders] = await Promise.all([
    supabase.from("products").select("id,name,sku,stock,reserved_stock,low_stock_threshold,is_active").order("updated_at", { ascending: false }),
    listOrders(getOrderPersistenceConfig())
  ]);
  const totalRevenue = orders.filter((order) => paidOrderStatuses.has(order.status)).reduce((sum, order) => sum + order.amount_paise, 0) / 100;
  const productRows = products.data || [];
  const lowStock = productRows.filter((product) => product.stock - product.reserved_stock > 0 && product.stock - product.reserved_stock <= product.low_stock_threshold).length;
  const outOfStock = productRows.filter((product) => product.stock - product.reserved_stock <= 0).length;
  const pendingOrders = orders.filter((order) => pendingOrderStatuses.has(order.status)).length;
  const uniqueCustomers = new Set(orders.map((order) => order.customer_email || order.customer_phone).filter(Boolean)).size;
  const report = salesReport(orders);
  const monthly = report.monthlyRevenue.slice(0, 6);
  const maxRevenue = Math.max(...monthly.map(([, paise]) => paise), 1);
  const recentOrders = orders.slice(0, 6);

  return (
    <>
      <AdminPageHeader
        kicker="Operations"
        title={`Welcome, ${profile.display_name || "Administrator"}`}
        description="A premium command center for revenue, orders, products, stock, and customer signals."
        action={<Link href="/admin/products/new" className="rounded-xl bg-amber-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-amber-600/20 transition hover:bg-amber-700">Add Product</Link>}
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Revenue" value={formatPrice(totalRevenue)} meta="Paid, packed, shipped, delivered" href="/admin/reports" icon={Banknote} tone="green" />
        <AdminStatCard label="Orders" value={orders.length} meta={`${pendingOrders} pending fulfilment`} href="/admin/orders" icon={ClipboardList} tone="blue" />
        <AdminStatCard label="Products" value={productRows.length} meta={`${productRows.filter((product) => product.is_active).length} active products`} href="/admin/products" icon={ShoppingBag} tone="amber" />
        <AdminStatCard label="Customers" value={uniqueCustomers} meta="From recent order history" href="/admin/customers" icon={Users} tone="slate" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Low Stock" value={lowStock} meta="Needs replenishment" href="/admin/inventory?status=low" icon={AlertTriangle} tone="amber" />
        <AdminStatCard label="Out of Stock" value={outOfStock} meta="Unavailable products" href="/admin/inventory?status=out" icon={PackageX} tone="rose" />
        <AdminStatCard label="Pending Orders" value={pendingOrders} meta="Created or authorized" href="/admin/orders?status=pending" icon={PackageCheck} tone="blue" />
        <AdminStatCard label="Paid Orders" value={orders.filter((order) => paidOrderStatuses.has(order.status)).length} meta="Ready operational pipeline" href="/admin/orders?status=paid" icon={ClipboardList} tone="green" />
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <AdminCard>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-950">Sales Graph</h2>
              <p className="mt-1 text-sm text-slate-500">Monthly revenue from completed payment states.</p>
            </div>
            <Link href="/admin/reports" className="text-sm font-black text-amber-700">View analytics</Link>
          </div>
          {monthly.length ? (
            <div className="mt-8 flex h-64 items-end gap-3 sm:gap-5">
              {monthly.map(([month, paise]) => (
                <div key={month} className="flex min-w-0 flex-1 flex-col items-center gap-3">
                  <div className="flex h-52 w-full items-end rounded-t-2xl bg-slate-50 p-2">
                    <div className="w-full rounded-t-xl bg-gradient-to-t from-amber-700 to-amber-400 shadow-lg shadow-amber-600/10" style={{ height: `${Math.max((paise / maxRevenue) * 100, 8)}%` }} title={formatPrice(paise / 100)} />
                  </div>
                  <p className="truncate text-xs font-black text-slate-500">{month}</p>
                </div>
              ))}
            </div>
          ) : <AdminEmptyState title="No sales data yet" description="Paid order revenue will appear here after customers complete checkout." />}
        </AdminCard>
        <AdminCard>
          <h2 className="text-xl font-black text-slate-950">Top Selling Products</h2>
          <div className="mt-5 grid gap-4">
            {report.bestSellers.slice(0, 5).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <div className="min-w-0">
                  <p className="truncate font-black text-slate-950">{index + 1}. {item.name}</p>
                  <p className="text-xs font-semibold text-slate-500">{item.quantity} sold</p>
                </div>
                <p className="shrink-0 font-black text-amber-700">{formatPrice(item.revenuePaise / 100)}</p>
              </div>
            ))}
            {!report.bestSellers.length ? <AdminEmptyState title="No best sellers yet" description="Top selling products will populate from paid orders." /> : null}
          </div>
        </AdminCard>
      </div>
      <AdminCard className="mt-8" padded={false}>
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <h2 className="text-xl font-black text-slate-950">Recent Orders</h2>
            <p className="mt-1 text-sm text-slate-500">Latest customer purchases and fulfilment states.</p>
          </div>
          <Link href="/admin/orders" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-900 transition hover:border-amber-300 hover:text-amber-700">View all</Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recentOrders.map((order) => (
            <Link href={`/admin/orders/${order.id}`} key={order.id} className="grid gap-3 p-5 transition hover:bg-slate-50 md:grid-cols-[1fr_auto]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-mono text-xs font-black text-amber-700">{order.id}</p>
                  <AdminStatusBadge tone={paidOrderStatuses.has(order.status) ? "green" : pendingOrderStatuses.has(order.status) ? "amber" : order.status === "cancelled" || order.status === "payment_failed" ? "red" : "slate"}>{orderStatusLabel(order.status)}</AdminStatusBadge>
                </div>
                <p className="mt-2 font-black text-slate-950">{order.product_name}</p>
                <p className="mt-1 text-sm text-slate-500">{order.customer_email || "No email"} · {order.customer_phone || "No phone"}</p>
              </div>
              <div className="md:text-right">
                <p className="text-lg font-black text-slate-950">{formatPrice(order.amount_paise / 100)}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{order.created_at ? new Date(order.created_at).toLocaleString("en-IN") : "Date unavailable"}</p>
              </div>
            </Link>
          ))}
          {!recentOrders.length ? <div className="p-5"><AdminEmptyState title="No orders yet" description="Recent orders will appear here once checkout starts receiving purchases." /></div> : null}
        </div>
      </AdminCard>
    </>
  );
}
