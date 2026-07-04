"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { CalendarDays, CreditCard, Home, MapPinned, PackageCheck, ReceiptText, Truck } from "lucide-react";
import { formatPrice } from "@/lib/products";
import type { Customer, CustomerOrder } from "@/lib/auth";

function formatDate(value?: string | null) {
  if (!value) return "To be confirmed";
  return new Date(value.includes("T") ? value : `${value}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function statusLabel(status: string) {
  return status === "cod_pending" ? "Created - Cash on Delivery" : status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function paymentStatusLabel(order: CustomerOrder) {
  if (order.status === "payment_failed") return "Payment Failed";
  if (order.status === "cod_pending") return "Cash on Delivery";
  if (["paid", "confirmed", "packed", "shipped", "delivered"].includes(order.status)) return "Paid";
  return order.payment_method ? statusLabel(order.payment_method) : "Pending";
}

export function AccountPanel({ customer, orders, ordersLoadError = false }: { customer: Customer; orders: CustomerOrder[]; ordersLoadError?: boolean }) {
  const latestOrderHref = orders[0] ? `/account/orders/${orders[0].id}` : "/account/orders";

  return (
    <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:gap-7">
      <aside className="rounded-3xl bg-maroon p-5 text-white shadow-premium md:p-7">
        <p className="section-kicker">Customer</p>
        <h2 className="mt-3 text-3xl font-black leading-tight">{customer.name}</h2>
        <div className="mt-6 grid gap-2 text-white/78">
          <p className="break-all">{customer.email}</p>
          <p>{customer.phone}</p>
        </div>
        <button onClick={() => signOut({ redirectTo: "/login" })} type="button" className="btn btn-secondary mt-8 w-full sm:w-fit">
          Logout
        </button>
      </aside>

      <section className="premium-card rounded-3xl p-4 md:p-7">
        <h2 className="text-3xl font-black leading-tight">Your dashboard</h2>
        <div className="mt-6 grid gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Link href="/account/orders" className="rounded-2xl border border-gold/20 bg-ivory p-5 transition hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-card">
              <ReceiptText size={22} className="text-maroon" aria-hidden="true" />
              <h3 className="mt-3 font-black">Orders</h3>
              <p className="mt-1 text-sm leading-6 text-ink/62">Track purchases and view order details.</p>
            </Link>
            <Link href="/account/addresses" className="rounded-2xl border border-gold/20 bg-ivory p-5 transition hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-card">
              <Home size={22} className="text-maroon" aria-hidden="true" />
              <h3 className="mt-3 font-black">Addresses</h3>
              <p className="mt-1 text-sm leading-6 text-ink/62">Manage delivery locations for future orders.</p>
            </Link>
            <Link href={latestOrderHref} className="rounded-2xl border border-gold/20 bg-ivory p-5 transition hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-card">
              <PackageCheck size={22} className="text-maroon" aria-hidden="true" />
              <h3 className="mt-3 font-black">Track Orders</h3>
              <p className="mt-1 text-sm leading-6 text-ink/62">Track your shipment in real time.</p>
            </Link>
          </div>

          <div className="rounded-2xl border border-gold/20 bg-ivory p-4 md:p-5">
            <h3 className="font-black">Order History</h3>
            {ordersLoadError ? (
              <div className="mt-4 rounded-2xl border border-gold/25 bg-white p-4 text-sm leading-6 text-ink/70 shadow-card">
                <p className="font-black text-maroon">Orders could not be loaded right now.</p>
                <p className="mt-1">Your profile is available. Please refresh this page or try again in a moment to view your orders.</p>
              </div>
            ) : orders.length > 0 ? (
              <div className="mt-4 grid gap-4">
                {orders.map((order) => (
                  <article key={order.id} className="rounded-2xl border border-gold/20 bg-white p-4 text-sm shadow-card">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-maroon">{order.product_name}</p>
                        <p className="mt-1 break-all font-mono text-xs font-bold text-ink/55">Order ID: {order.id}</p>
                      </div>
                      <p className="font-black text-maroon">{formatPrice(order.amount_paise / 100)}</p>
                    </div>

                    <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="flex gap-2"><CalendarDays size={17} className="mt-0.5 text-gold" /><div><dt className="font-bold text-ink/58">Order Date</dt><dd>{formatDate(order.created_at)}</dd></div></div>
                      <div className="flex gap-2"><CreditCard size={17} className="mt-0.5 text-gold" /><div><dt className="font-bold text-ink/58">Payment Status</dt><dd>{paymentStatusLabel(order)}</dd></div></div>
                      <div className="flex gap-2"><PackageCheck size={17} className="mt-0.5 text-gold" /><div><dt className="font-bold text-ink/58">Order Status</dt><dd>{statusLabel(order.status)}</dd></div></div>
                      <div className="flex gap-2"><Truck size={17} className="mt-0.5 text-gold" /><div><dt className="font-bold text-ink/58">Shipping</dt><dd className="font-bold text-green-700">FREE</dd></div></div>
                      {order.tracking_number ? <div className="flex gap-2"><Truck size={17} className="mt-0.5 text-gold" /><div><dt className="font-bold text-ink/58">Tracking Number</dt><dd className="font-mono">{order.tracking_number}</dd></div></div> : null}
                      <div className="flex gap-2"><MapPinned size={17} className="mt-0.5 text-gold" /><div><dt className="font-bold text-ink/58">Estimated Delivery</dt><dd>{formatDate(order.estimated_delivery_date)}</dd></div></div>
                    </dl>

                    <Link href={`/account/orders/${order.id}`} className="btn btn-primary mt-4 w-full min-h-10 rounded-xl px-4 py-2 text-sm sm:w-fit">
                      Track Order
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm leading-6 text-ink/62">Your secure online orders will appear here.</p>
            )}
          </div>

          <Link href="/collections" className="btn btn-primary w-full sm:w-fit">
            Continue Shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
