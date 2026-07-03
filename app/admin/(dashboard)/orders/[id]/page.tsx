import { notFound } from "next/navigation";
import { updateOrderStatusAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/backend/auth";
import { formatOrderAddress, orderStatusLabel, paymentMethodLabel } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { getOrderById, getOrderPersistenceConfig, type OrderStatus } from "@/lib/payments";
import { OrderTimeline } from "@/components/orders/OrderTimeline";

const statuses: OrderStatus[] = ["created", "cod_pending", "payment_authorized", "paid", "confirmed", "packed", "shipped", "delivered", "cancelled", "payment_failed"];

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await getOrderById(id, getOrderPersistenceConfig());
  if (!order) notFound();
  return <><p className="section-kicker">Order Operations</p><h1 className="mt-2 break-all text-3xl">{order.id}</h1>
    <section className="mt-7 rounded-lg border border-outline-variant bg-white p-5 shadow-card"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-sm text-on-surface-variant">Current status</p><p className="mt-1 text-xl font-bold text-primary">{orderStatusLabel(order.status)}</p></div><p className="text-2xl font-bold text-primary">{formatPrice(order.amount_paise / 100)}</p></div><div className="mt-7"><OrderTimeline status={order.status} /></div></section>
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]"><section className="rounded-lg border border-outline-variant bg-white p-5 shadow-card"><h2 className="text-xl font-bold">Customer and Delivery</h2><dl className="mt-4 grid gap-3 text-sm"><div><dt className="font-bold">Customer</dt><dd>{order.delivery_address?.fullName}<br />{order.customer_email}<br />{order.customer_phone}</dd></div><div><dt className="font-bold">Address</dt><dd>{formatOrderAddress(order.delivery_address)}</dd></div><div><dt className="font-bold">Payment</dt><dd>{paymentMethodLabel(order.payment_method)} · {order.status}</dd></div><div><dt className="font-bold">Shipping</dt><dd className="font-bold text-green-700">FREE</dd></div><div><dt className="font-bold">Estimated delivery</dt><dd>{order.estimated_delivery_date || "Not set"}</dd></div><div><dt className="font-bold">Invoice</dt><dd><a className="font-bold text-primary underline" href={`/api/orders/${order.id}/invoice`}>Download invoice</a></dd></div></dl><h2 className="mt-7 text-xl font-bold">Products</h2><div className="mt-3 grid gap-3">{(order.order_items || []).map((item) => <div key={`${item.productId}-${item.giftBox}`} className="flex justify-between border-t border-outline-variant pt-3"><span>{item.productName} × {item.quantity}</span><strong>{formatPrice((item.unitPricePaise * item.quantity) / 100)}</strong></div>)}</div></section>
      <form action={updateOrderStatusAction} className="grid h-fit gap-4 rounded-lg border border-outline-variant bg-white p-5 shadow-card"><h2 className="text-xl font-bold">Update Fulfilment</h2><input type="hidden" name="id" value={order.id} /><label className="grid gap-1 text-sm font-bold">Status<select name="status" defaultValue={order.status} className="rounded-lg border border-outline-variant px-3 py-3">{statuses.map((status) => <option key={status} value={status}>{orderStatusLabel(status)}</option>)}</select></label><label className="grid gap-1 text-sm font-bold">Tracking Number<input name="trackingNumber" defaultValue={order.tracking_number || ""} className="rounded-lg border border-outline-variant px-3 py-3" /></label><button className="rounded-lg bg-primary px-5 py-3 font-bold text-white">Save Order Status</button></form></div></>;
}
