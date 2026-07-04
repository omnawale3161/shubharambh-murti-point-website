import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Download, MessageCircle, PackageCheck, Truck } from "lucide-react";
import { auth } from "@/auth";
import { AccountUnavailable } from "@/components/AccountUnavailable";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { getCustomerById, getCustomerOrders } from "@/lib/auth";
import { orderStatusLabel, paymentMethodLabel } from "@/lib/orders";
import { formatPrice, whatsappUrl } from "@/lib/products";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Track Order", "Track a verified order.", "/account/orders");

function formatDate(value?: string | null) {
  if (!value) return "To be confirmed";
  return new Date(value.includes("T") ? value : `${value}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function paymentStatus(status: string, method?: string | null) {
  if (status === "payment_failed") return "Payment Failed";
  if (status === "cod_pending") return "Cash on Delivery";
  if (["paid", "confirmed", "packed", "shipped", "delivered"].includes(status)) return "Paid";
  return method ? paymentMethodLabel(method) : "Pending";
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/orders");
  const { id } = await params;

  const customerResult = await getCustomerById(session.user.id)
    .then((customer) => ({ customer, failed: false }))
    .catch((error: unknown) => {
      console.error("Customer account could not be loaded", error);
      return { customer: null, failed: true };
    });
  const { customer } = customerResult;
  if (!customer) {
    if (customerResult.failed) return <AccountUnavailable />;
    redirect("/login");
  }

  const orders = await getCustomerOrders(customer.id).catch((error: unknown) => {
    console.error("Customer orders could not be loaded", error);
    return null;
  });
  if (!orders) return <AccountUnavailable message="We loaded your session, but could not load this order right now." />;

  const order = orders.find((item) => item.id === id);
  if (!order) notFound();

  const supportHref = `${whatsappUrl}?text=${encodeURIComponent(`Namaste, I need help tracking order ${order.id}.`)}`;

  return (
    <main className="premium-container py-10 md:py-24">
      <p className="section-kicker">Order Tracking</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl text-primary md:text-6xl">Track Order</h1>
          <p className="mt-3 break-all font-mono text-sm font-bold text-on-surface-variant">Order ID: {order.id}</p>
        </div>
        <Link href="/account/orders" className="btn btn-secondary min-h-10 rounded-full px-5 py-3 text-sm">
          Back to Orders
        </Link>
      </div>

      <section className="premium-card mt-8 rounded-3xl p-4 md:mt-10 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
          <h2 className="text-2xl leading-tight text-primary md:text-3xl">{order.product_name}</h2>
            <p className="mt-2 text-sm font-semibold text-on-surface-variant">Placed on {formatDate(order.created_at)}</p>
          </div>
          <span className="rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-800">{orderStatusLabel(order.status)}</span>
        </div>

        <div className="mt-8">
          <OrderTimeline status={order.status} createdAt={order.created_at} shippedAt={order.shipped_at} deliveredAt={order.delivered_at} estimatedDeliveryDate={order.estimated_delivery_date} />
        </div>

        {order.tracking_number ? <p className="mt-6 rounded-2xl bg-ivory p-4 text-sm"><strong>Tracking Number:</strong> <span className="font-mono">{order.tracking_number}</span></p> : null}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-3xl border border-gold/20 bg-white p-6 shadow-card">
          <h2 className="text-2xl font-bold text-primary">Order Summary</h2>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div><dt className="font-bold text-on-surface-variant">Payment Status</dt><dd className="mt-1 font-bold">{paymentStatus(order.status, order.payment_method)}</dd></div>
            <div><dt className="font-bold text-on-surface-variant">Order Status</dt><dd className="mt-1 font-bold">{orderStatusLabel(order.status)}</dd></div>
            <div><dt className="font-bold text-on-surface-variant">Estimated Delivery</dt><dd className="mt-1 font-bold">{formatDate(order.estimated_delivery_date)}</dd></div>
            <div><dt className="font-bold text-on-surface-variant">Packing</dt><dd className="mt-1 font-bold">{order.gift_box ? "Gift box included" : "Standard packing"}</dd></div>
            <div><dt className="font-bold text-on-surface-variant">Shipping</dt><dd className="mt-1 font-bold text-green-700">FREE</dd></div>
            <div className="sm:col-span-2"><dt className="font-bold text-on-surface-variant">Total</dt><dd className="mt-1 text-2xl font-black text-primary">{formatPrice(order.amount_paise / 100)}</dd></div>
          </dl>
        </section>

        <aside className="grid h-fit gap-4">
          <a href={`/api/orders/${order.id}/invoice`} className="btn btn-secondary rounded-xl px-5 py-3">
            <Download size={18} />Download Invoice
          </a>
          <section className="rounded-3xl border border-gold/20 bg-white p-6 shadow-card">
            <div className="flex items-center gap-3 text-primary"><MessageCircle size={20} /><h2 className="text-xl font-bold">Need Help?</h2></div>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">Our support team can help with shipment updates, delivery questions, or address guidance.</p>
          <a href={supportHref} target="_blank" rel="noopener noreferrer" className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-whatsapp px-5 py-3 font-bold text-white transition hover:-translate-y-0.5">
              <WhatsAppIcon size={20} />WhatsApp Support
            </a>
          </section>
          <Link href="/collections" className="btn btn-primary rounded-xl px-5 py-3">
            <PackageCheck size={18} />Browse Collection
          </Link>
          <div className="rounded-3xl border border-gold/20 bg-ivory p-5 text-sm font-bold text-primary">
            <Truck size={18} className="mb-2 text-gold" />Secure packing and delivery updates are handled by our fulfilment team.
          </div>
        </aside>
      </div>
    </main>
  );
}
