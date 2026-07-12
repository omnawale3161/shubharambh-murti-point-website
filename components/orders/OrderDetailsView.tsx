import Image from "next/image";
import Link from "next/link";
import { Download, ShoppingBag, Truck } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { formatPrice, getProductById, whatsappUrl } from "@/lib/products";
import { formatOrderAddress, orderStatusLabel, paymentMethodLabel, whatsappOrderConfirmation } from "@/lib/orders";
import type { PersistedOrder } from "@/lib/payments";
import { OrderTimeline } from "./OrderTimeline";

export function OrderDetailsView({ order, token, success = false }: { order: PersistedOrder; token: string; success?: boolean }) {
  const trackingHref = `/orders/${order.id}?token=${encodeURIComponent(token)}`;
  const invoiceHref = `/api/orders/${order.id}/invoice?token=${encodeURIComponent(token)}`;
  const whatsappHref = `${whatsappUrl}?text=${encodeURIComponent(whatsappOrderConfirmation(order))}`;
  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-outline-variant bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-sm font-bold text-on-surface-variant">Order ID</p><p className="mt-1 break-all font-mono text-sm font-bold text-primary">{order.id}</p></div>
          <span className="rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-800">{orderStatusLabel(order.status)}</span>
        </div>
        <div className="mt-7"><OrderTimeline status={order.status} createdAt={order.created_at} shippedAt={order.shipped_at} deliveredAt={order.delivered_at} estimatedDeliveryDate={order.estimated_delivery_date} /></div>
        {order.tracking_number ? <p className="mt-6 rounded-lg bg-surface-container p-4 text-sm"><strong>Tracking Number:</strong> {order.tracking_number}</p> : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-lg border border-outline-variant bg-white p-5 shadow-card">
          <h2 className="text-2xl font-bold text-primary">Ordered Products</h2>
          <div className="mt-4 grid gap-4">{(order.order_items || []).map((item) => {
            const product = getProductById(item.productId);
            const productImage = item.productImage || product?.image;
            return <article key={`${item.productId}-${item.giftBox}`} className="grid grid-cols-[80px_1fr] gap-4 border-t border-outline-variant pt-4">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-surface-container-low">{productImage ? <Image src={productImage} alt={item.productName} fill sizes="80px" className="object-contain p-1" /> : null}</div>
              <div><h3 className="font-bold">{item.productName}</h3><p className="mt-1 text-sm text-on-surface-variant">Quantity: {item.quantity}{item.giftBox ? " · Gift box included" : ""}</p><p className="mt-2 font-bold text-primary">{formatPrice((item.unitPricePaise * item.quantity) / 100)}</p></div>
            </article>;
          })}</div>
        </section>
        <aside className="grid h-fit gap-5">
          <section className="rounded-lg border border-outline-variant bg-white p-5 shadow-card"><h2 className="text-xl font-bold text-primary">Delivery Address</h2><p className="mt-3 font-bold">{order.delivery_address?.fullName}</p><p className="mt-2 text-sm leading-6 text-on-surface-variant">{formatOrderAddress(order.delivery_address)}</p><p className="mt-3 text-sm">{order.customer_phone}<br />{order.customer_email}</p></section>
          <section className="rounded-lg border border-outline-variant bg-white p-5 shadow-card"><h2 className="text-xl font-bold text-primary">Payment Details</h2><dl className="mt-3 grid gap-2 text-sm"><div className="flex justify-between"><dt>Method</dt><dd>{paymentMethodLabel(order.payment_method)}</dd></div><div className="flex justify-between"><dt>Status</dt><dd className="capitalize">{order.status.replaceAll("_", " ")}</dd></div><div className="flex justify-between"><dt>Shipping</dt><dd className="font-bold text-green-700">FREE</dd></div><div className="flex justify-between border-t border-outline-variant pt-3 text-lg font-black"><dt>Total</dt><dd>{formatPrice(order.amount_paise / 100)}</dd></div></dl><p className="mt-4 flex items-center gap-2 text-sm font-bold text-green-700"><Truck size={17} />Estimated delivery: {order.estimated_delivery_date ? new Date(`${order.estimated_delivery_date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "To be confirmed"}</p></section>
        </aside>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/collections" className="btn btn-primary rounded-lg px-5 py-3"><ShoppingBag size={18} />Continue Shopping</Link>
        {success ? <Link href={trackingHref} className="btn btn-secondary rounded-lg px-5 py-3"><Truck size={18} />Track Order</Link> : null}
        <a href={invoiceHref} className="btn btn-secondary rounded-lg px-5 py-3"><Download size={18} />Download Invoice</a>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-whatsapp px-5 py-3 font-bold text-white transition hover:-translate-y-0.5"><WhatsAppIcon size={20} />Need Help? WhatsApp Support</a>
      </div>
    </div>
  );
}
