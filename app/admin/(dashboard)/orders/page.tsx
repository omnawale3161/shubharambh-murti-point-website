import Link from "next/link";
import { Download, Search } from "lucide-react";
import { requireAdmin } from "@/lib/backend/auth";
import { formatOrderAddress, orderStatusLabel } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { getOrderPersistenceConfig, listOrders, type OrderStatus } from "@/lib/payments";

const filterStatuses: OrderStatus[] = ["created", "confirmed", "packed", "shipped", "delivered", "cancelled", "payment_failed"];

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireAdmin();
  const { q = "", status = "all" } = await searchParams;
  const allOrders = await listOrders(getOrderPersistenceConfig(), q.trim().slice(0, 100));
  const paid = new Set(["paid", "confirmed", "packed", "shipped", "delivered"]);
  const pending = new Set(["created", "cod_pending", "payment_authorized"]);
  const orders = allOrders.filter((order) => status === "all" || order.status === status || (status === "paid" && paid.has(order.status)) || (status === "pending" && pending.has(order.status)));

  return <><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="section-kicker">Fulfilment</p><h1 className="mt-2 text-4xl">Orders</h1></div><a href="/api/admin/orders/export" className="flex items-center gap-2 rounded-lg border border-primary px-4 py-2 font-bold text-primary"><Download size={17} />Export CSV</a></div>
    <form className="mt-7 grid max-w-3xl gap-2 sm:grid-cols-[1fr_190px_auto]"><label className="relative"><span className="sr-only">Search orders</span><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" /><input name="q" defaultValue={q} placeholder="Search ID, product, email, or phone" className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-3" /></label><select name="status" defaultValue={status} aria-label="Filter by order status" className="rounded-lg border border-outline-variant bg-white px-3 py-3"><option value="all">All statuses</option><option value="pending">Pending orders</option><option value="paid">Paid orders</option>{filterStatuses.map((value) => <option key={value} value={value}>{orderStatusLabel(value)}</option>)}</select><button className="rounded-lg bg-primary px-5 py-3 font-bold text-white">Filter</button></form>
    <div className="mt-7 grid gap-4">{orders.length ? orders.map((order) => <Link href={`/admin/orders/${order.id}`} key={order.id} className="grid gap-4 rounded-lg border border-outline-variant bg-white p-5 shadow-card transition hover:border-primary md:grid-cols-[1fr_auto]"><div><div className="flex flex-wrap items-center gap-3"><h2 className="font-mono text-sm font-bold text-primary">{order.id}</h2><span className="rounded-full bg-surface-container px-3 py-1 text-xs font-bold">{orderStatusLabel(order.status)}</span></div><p className="mt-2 text-lg font-bold">{order.product_name}</p><p className="mt-1 text-sm text-on-surface-variant">{order.customer_email} · {order.customer_phone}</p><p className="mt-1 line-clamp-1 text-xs text-on-surface-variant">{formatOrderAddress(order.delivery_address)}</p></div><div className="md:text-right"><p className="text-xl font-bold text-primary">{formatPrice(order.amount_paise / 100)}</p><p className="mt-1 text-xs text-on-surface-variant">{new Date(order.created_at || "").toLocaleString("en-IN")}</p></div></Link>) : <p className="rounded-lg border border-outline-variant bg-white p-6">No matching orders.</p>}</div></>;
}
