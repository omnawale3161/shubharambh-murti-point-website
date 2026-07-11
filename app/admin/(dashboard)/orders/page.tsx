import Link from "next/link";
import { Download, Search, Truck } from "lucide-react";
import { AdminEmptyState, AdminPageHeader, AdminStatusBadge, AdminTableShell } from "@/components/admin/AdminUI";
import { requireAdmin } from "@/lib/backend/auth";
import { formatOrderAddress, orderStatusLabel, orderStatuses, paidOrderStatuses, pendingOrderStatuses } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { getOrderPersistenceConfig, listOrders, type OrderStatus } from "@/lib/payments";

function statusTone(status: OrderStatus) {
  if (paidOrderStatuses.has(status)) return "green" as const;
  if (pendingOrderStatuses.has(status)) return "amber" as const;
  if (status === "cancelled" || status === "payment_failed") return "red" as const;
  return "slate" as const;
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireAdmin();
  const { q = "", status = "all" } = await searchParams;
  const allOrders = await listOrders(getOrderPersistenceConfig(), q.trim().slice(0, 100));
  const orders = allOrders.filter((order) => status === "all" || order.status === status || (status === "paid" && paidOrderStatuses.has(order.status)) || (status === "pending" && pendingOrderStatuses.has(order.status)));

  return (
    <>
      <AdminPageHeader
        kicker="Fulfilment"
        title="Orders"
        description="Search, filter, inspect customer details, update fulfilment, print invoices, and track shipments."
        action={<a href="/api/admin/orders/export" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-900 transition hover:border-amber-300 hover:text-amber-700"><Download size={17} />Export CSV</a>}
      />
      <form className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:grid-cols-[1fr_210px_auto]">
        <label className="relative">
          <span className="sr-only">Search orders</span>
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input name="q" defaultValue={q} placeholder="Search ID, product, email, or phone" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" />
        </label>
        <select name="status" defaultValue={status} aria-label="Filter by order status" className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10">
          <option value="all">All statuses</option>
          <option value="pending">Pending orders</option>
          <option value="paid">Paid orders</option>
          {orderStatuses.map((value) => <option key={value} value={value}>{orderStatusLabel(value)}</option>)}
        </select>
        <button className="h-11 rounded-xl bg-amber-600 px-5 text-sm font-black text-white shadow-lg shadow-amber-600/20 transition hover:bg-amber-700">Filter</button>
      </form>
      <div className="mt-8">
        <AdminTableShell>
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Order</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Tracking</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs font-black text-amber-700">{order.id}</p>
                    <p className="mt-2 font-black text-slate-950">{order.product_name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{order.created_at ? new Date(order.created_at).toLocaleString("en-IN") : "Date unavailable"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-950">{order.delivery_address?.fullName || "Customer"}</p>
                    <p className="mt-1 text-xs text-slate-500">{order.customer_email || "No email"} · {order.customer_phone || "No phone"}</p>
                    <p className="mt-1 line-clamp-1 max-w-xs text-xs text-slate-500">{formatOrderAddress(order.delivery_address)}</p>
                  </td>
                  <td className="px-5 py-4"><AdminStatusBadge tone={paidOrderStatuses.has(order.status) ? "green" : order.status === "payment_failed" ? "red" : "amber"}>{paidOrderStatuses.has(order.status) ? "Paid" : order.status === "payment_failed" ? "Failed" : "Pending"}</AdminStatusBadge></td>
                  <td className="px-5 py-4"><AdminStatusBadge tone={statusTone(order.status)}>{orderStatusLabel(order.status)}</AdminStatusBadge></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Truck size={16} className="text-slate-400" />
                      {order.tracking_number || "Not added"}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{order.estimated_delivery_date || "ETA not set"}</p>
                  </td>
                  <td className="px-5 py-4 font-black text-slate-950">{formatPrice(order.amount_paise / 100)}</td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/orders/${order.id}`} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-900 transition hover:border-amber-300 hover:text-amber-700">View order</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!orders.length ? <div className="p-5"><AdminEmptyState title="No matching orders" description="Try a different search term or status filter." /></div> : null}
        </AdminTableShell>
      </div>
    </>
  );
}
