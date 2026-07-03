"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Download, MapPinned, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/products";
import type { PaymentMethod } from "@/lib/shop";

type ConfirmationOrder = {
  internalOrderId: string;
  accessToken: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  estimatedDeliveryDate: string;
};

const paymentLabels: Record<PaymentMethod, string> = {
  razorpay_upi: "Razorpay UPI",
  google_pay: "Google Pay",
  phonepe: "PhonePe",
  paytm: "Paytm",
  credit_card: "Credit Card",
  debit_card: "Debit Card",
  net_banking: "Net Banking",
  cash_on_delivery: "Cash on Delivery"
};

const confetti = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  color: ["#16a34a", "#f59e0b", "#780b22", "#2563eb"][index % 4],
  x: ((index * 37) % 220) - 110,
  rotate: (index * 71) % 360,
  delay: (index % 6) * 0.06
}));

export function OrderConfirmationModal({ order }: { order: ConfirmationOrder }) {
  const successHref = `/order-success?id=${encodeURIComponent(order.internalOrderId)}&token=${encodeURIComponent(order.accessToken)}`;
  const trackHref = `/orders/${encodeURIComponent(order.internalOrderId)}?token=${encodeURIComponent(order.accessToken)}`;
  const invoiceHref = `/api/orders/${encodeURIComponent(order.internalOrderId)}/invoice?token=${encodeURIComponent(order.accessToken)}`;

  useEffect(() => {
    toast.success("Order placed successfully");
    const redirectTimer = window.setTimeout(() => window.location.assign(successHref), 3000);
    return () => window.clearTimeout(redirectTimer);
  }, [successHref]);

  async function trackOrder() {
    try {
      await navigator.clipboard.writeText(new URL(trackHref, window.location.origin).toString());
      toast.success("Tracking link copied");
    } catch {
      // Navigation remains available when clipboard permission is denied.
    }
    window.location.assign(trackHref);
  }

  function downloadInvoice() {
    window.open(invoiceHref, "_blank", "noopener,noreferrer");
    toast.success("Invoice downloaded");
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/55 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-confirmed-title"
    >
      <motion.section
        className="relative w-full max-w-lg overflow-hidden rounded-lg border border-green-200 bg-white p-5 shadow-2xl sm:p-7"
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-20">
          {confetti.map((piece) => (
            <motion.span
              key={piece.id}
              className="absolute block h-2 w-1.5 rounded-sm"
              style={{ backgroundColor: piece.color }}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{ x: piece.x, y: 145 + (piece.id % 4) * 20, opacity: 0, rotate: piece.rotate }}
              transition={{ duration: 1.4, delay: piece.delay, ease: "easeOut" }}
            />
          ))}
        </div>

        <div className="relative text-center">
          <motion.div
            className="mx-auto grid size-20 place-items-center rounded-full bg-green-600 text-white shadow-lg shadow-green-200"
            initial={{ scale: 0, rotate: -25 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.15 }}
          >
            <motion.div initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.35 }}>
              <Check size={44} strokeWidth={3} />
            </motion.div>
          </motion.div>
          <h2 id="order-confirmed-title" className="mt-5 text-3xl font-black text-green-800">Order Confirmed!</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Your order has been placed successfully.</p>
        </div>

        <dl className="relative mt-6 grid gap-3 rounded-lg bg-surface-container-low p-4 text-sm">
          <div className="flex items-start justify-between gap-4"><dt className="text-on-surface-variant">Order ID</dt><dd className="break-all text-right font-bold">{order.internalOrderId}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-on-surface-variant">Total Amount</dt><dd className="font-black text-primary">{formatPrice(order.totalAmount)}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-on-surface-variant">Payment Method</dt><dd className="text-right font-bold">{paymentLabels[order.paymentMethod]}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-on-surface-variant">Estimated Delivery</dt><dd className="text-right font-bold">{new Date(`${order.estimatedDeliveryDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</dd></div>
        </dl>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => void trackOrder()} className="btn btn-primary rounded-lg px-4 py-3">
            <MapPinned size={19} /> Track Order
          </button>
          <button type="button" onClick={downloadInvoice} className="btn btn-secondary rounded-lg px-4 py-3">
            <Download size={19} /> Download Invoice
          </button>
          <button type="button" onClick={() => window.location.assign("/collections")} className="btn btn-secondary rounded-lg px-4 py-3 sm:col-span-2">
            <ShoppingBag size={19} /> Continue Shopping
          </button>
        </div>
        <p className="relative mt-4 text-center text-xs text-on-surface-variant">Opening order details automatically in 3 seconds...</p>
      </motion.section>
    </motion.div>
  );
}
