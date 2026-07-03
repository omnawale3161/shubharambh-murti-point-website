import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, CreditCard, MapPinned, PackageCheck, Truck } from "lucide-react";
import { auth } from "@/auth";
import { getCustomerOrders } from "@/lib/auth";
import { orderStatusLabel, paymentMethodLabel } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("My Orders", "View your verified orders.", "/account/orders");

function formatDate(value?: string | null) {
  if (!value) return "To be confirmed";
  return new Date(value.includes("T") ? value : `${value}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function paymentStatus(status: string, method?: string | null) {
  if (status === "payment_failed") return "Payment Failed";
  if (status === "cod_pending") return "Cash on Delivery";
  if (["paid", "confirmed", "packed", "shipped", "delivered"].includes(status)) return "Paid";
  return method ? paymentMethodLabel(method) : "Pending";
}

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/orders");
  const orders = await getCustomerOrders(session.user.id);

  return (
    <main className="premium-container py-16 md:py-24">
      <p className="section-kicker">Your Sanctuary</p>
      <h1 className="mt-3 text-5xl text-primary md:text-6xl">My Orders</h1>
      <div className="mt-10 grid gap-5">
        {orders.length ? orders.map((order) => (
          <article key={order.id} className="premium-card rounded-3xl p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl text-primary">{order.product_name}</h2>
                <p className="mt-2 break-all font-mono text-xs font-bold text-on-surface-variant">Order ID: {order.id}</p>
              </div>
              <p className="font-semibold text-primary">{formatPrice(order.amount_paise / 100)}</p>
            </div>

            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-5">
              <div className="flex gap-2"><CalendarDays size={17} className="mt-0.5 text-gold" /><div><dt className="font-bold text-on-surface-variant">Order Date</dt><dd>{formatDate(order.created_at)}</dd></div></div>
              <div className="flex gap-2"><CreditCard size={17} className="mt-0.5 text-gold" /><div><dt className="font-bold text-on-surface-variant">Payment Status</dt><dd>{paymentStatus(order.status, order.payment_method)}</dd></div></div>
              <div className="flex gap-2"><PackageCheck size={17} className="mt-0.5 text-gold" /><div><dt className="font-bold text-on-surface-variant">Order Status</dt><dd>{orderStatusLabel(order.status)}</dd></div></div>
              <div className="flex gap-2"><Truck size={17} className="mt-0.5 text-gold" /><div><dt className="font-bold text-on-surface-variant">Shipping</dt><dd className="font-bold text-green-700">FREE</dd></div></div>
              {order.tracking_number ? <div className="flex gap-2"><Truck size={17} className="mt-0.5 text-gold" /><div><dt className="font-bold text-on-surface-variant">Tracking Number</dt><dd className="font-mono">{order.tracking_number}</dd></div></div> : null}
              <div className="flex gap-2"><MapPinned size={17} className="mt-0.5 text-gold" /><div><dt className="font-bold text-on-surface-variant">Estimated Delivery</dt><dd>{formatDate(order.estimated_delivery_date)}</dd></div></div>
            </dl>

            <Link href={`/account/orders/${order.id}`} className="btn btn-primary mt-6 min-h-10 rounded-xl px-5 py-3 text-sm">
              Track Order
            </Link>
          </article>
        )) : <div className="rounded-3xl bg-surface-container p-8"><h2 className="text-3xl text-primary">No orders yet</h2><p className="mt-3 text-on-surface-variant">Your verified Razorpay orders will appear here.</p></div>}
      </div>
    </main>
  );
}
