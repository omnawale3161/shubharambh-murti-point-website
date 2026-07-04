import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Printer, Save, Truck } from "lucide-react";
import { updateOrderStatusAction } from "@/app/admin/actions";
import { AdminCard, AdminPageHeader, AdminStatusBadge } from "@/components/admin/AdminUI";
import { requireAdmin } from "@/lib/backend/auth";
import { formatOrderAddress, orderStatusLabel, paymentMethodLabel } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { getOrderById, getOrderPersistenceConfig, type OrderStatus } from "@/lib/payments";
import { OrderTimeline } from "@/components/orders/OrderTimeline";

const statuses: OrderStatus[] = ["created", "cod_pending", "payment_authorized", "paid", "confirmed", "packed", "shipped", "delivered", "cancelled", "payment_failed"];
const paid = new Set(["paid", "confirmed", "packed", "shipped", "delivered"]);

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await getOrderById(id, getOrderPersistenceConfig());
  if (!order) notFound();

  return (
    <>
      <AdminPageHeader
        kicker="Order Operations"
        title={order.id}
        description="Review customer details, payment status, invoice, tracking number, and fulfilment timeline."
        action={<Link href="/admin/orders" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-900 transition hover:border-amber-300 hover:text-amber-700">Back to orders</Link>}
      />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <AdminCard><p className="text-sm font-bold text-slate-500">Order total</p><p className="mt-2 text-3xl font-black text-slate-950">{formatPrice(order.amount_paise / 100)}</p></AdminCard>
        <AdminCard><p className="text-sm font-bold text-slate-500">Payment</p><div className="mt-3"><AdminStatusBadge tone={paid.has(order.status) ? "green" : order.status === "payment_failed" ? "red" : "amber"}>{paid.has(order.status) ? "Paid" : order.status === "payment_failed" ? "Failed" : "Pending"}</AdminStatusBadge></div></AdminCard>
        <AdminCard><p className="text-sm font-bold text-slate-500">Fulfilment</p><p className="mt-2 text-2xl font-black text-amber-700">{orderStatusLabel(order.status)}</p></AdminCard>
      </div>
      <AdminCard className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-950">Progress Timeline</h2>
            <p className="mt-1 text-sm text-slate-500">Confirmed, packed, shipped, out for delivery, and delivered states.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-900 transition hover:border-amber-300 hover:text-amber-700" href={`/api/orders/${order.id}/invoice`}><Download size={16} />Invoice</a>
            <a className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-900 transition hover:border-amber-300 hover:text-amber-700" href={`/api/orders/${order.id}/invoice`} target="_blank" rel="noreferrer"><Printer size={16} />Print</a>
          </div>
        </div>
        <div className="mt-7"><OrderTimeline status={order.status} /></div>
      </AdminCard>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <AdminCard>
          <h2 className="text-xl font-black text-slate-950">Customer and Delivery</h2>
          <dl className="mt-5 grid gap-5 text-sm md:grid-cols-2">
            <div><dt className="font-black text-slate-500">Customer</dt><dd className="mt-1 leading-6 text-slate-900">{order.delivery_address?.fullName || "Customer"}<br />{order.customer_email || "No email"}<br />{order.customer_phone || "No phone"}</dd></div>
            <div><dt className="font-black text-slate-500">Address</dt><dd className="mt-1 leading-6 text-slate-900">{formatOrderAddress(order.delivery_address)}</dd></div>
            <div><dt className="font-black text-slate-500">Payment Method</dt><dd className="mt-1 text-slate-900">{paymentMethodLabel(order.payment_method)} · {order.status}</dd></div>
            <div><dt className="font-black text-slate-500">Shipping</dt><dd className="mt-1 font-black text-emerald-700">FREE</dd></div>
            <div><dt className="font-black text-slate-500">Tracking Number</dt><dd className="mt-1 flex items-center gap-2 text-slate-900"><Truck size={16} className="text-slate-400" />{order.tracking_number || "Not added"}</dd></div>
            <div><dt className="font-black text-slate-500">Estimated Delivery</dt><dd className="mt-1 text-slate-900">{order.estimated_delivery_date || "Not set"}</dd></div>
          </dl>
          <h2 className="mt-8 text-xl font-black text-slate-950">Products</h2>
          <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-100">
            {(order.order_items || []).map((item) => (
              <div key={`${item.productId}-${item.giftBox}`} className="flex justify-between gap-4 p-4">
                <span className="font-bold text-slate-900">{item.productName} x {item.quantity}</span>
                <strong className="text-slate-950">{formatPrice((item.unitPricePaise * item.quantity) / 100)}</strong>
              </div>
            ))}
          </div>
        </AdminCard>
        <form action={updateOrderStatusAction} className="grid h-fit gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <h2 className="text-xl font-black text-slate-950">Update Fulfilment</h2>
          <input type="hidden" name="id" value={order.id} />
          <label className="grid gap-1.5 text-sm font-black text-slate-800">Status<select name="status" defaultValue={order.status} className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10">{statuses.map((status) => <option key={status} value={status}>{orderStatusLabel(status)}</option>)}</select></label>
          <label className="grid gap-1.5 text-sm font-black text-slate-800">Tracking Number<input name="trackingNumber" defaultValue={order.tracking_number || ""} className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" /></label>
          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 text-sm font-black text-white shadow-lg shadow-amber-600/20 transition hover:bg-amber-700"><Save size={17} />Save Order Status</button>
        </form>
      </div>
    </>
  );
}
