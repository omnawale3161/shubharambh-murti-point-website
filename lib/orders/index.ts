import { createHash, randomBytes } from "node:crypto";
import type { OrderAddress, OrderItem, OrderStatus, PersistedOrder } from "@/lib/payments";
export { orderStatusLabel, orderStatuses, paidOrderStatuses, pendingOrderStatuses } from "./status";

export type OrderTimelineStep = {
  key: "confirmed" | "packed" | "shipped" | "out_for_delivery" | "delivered";
  label: string;
  complete: boolean;
  current: boolean;
};

const statusRank: Record<OrderStatus, number> = {
  created: 0,
  cod_pending: 0,
  payment_authorized: 0,
  paid: 0,
  confirmed: 0,
  packed: 1,
  shipped: 2,
  out_for_delivery: 3,
  delivered: 4,
  cancelled: -1,
  payment_failed: -1
};

export function createOrderAccessToken() {
  const token = randomBytes(24).toString("base64url");
  return { token, hash: hashOrderAccessToken(token) };
}

export function hashOrderAccessToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function estimatedDeliveryDate(from = new Date()) {
  const date = new Date(from);
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
}

export function orderTimeline(status: OrderStatus): OrderTimelineStep[] {
  const rank = statusRank[status];
  const labels: Array<Pick<OrderTimelineStep, "key" | "label">> = [
    { key: "confirmed", label: "Order Confirmed" },
    { key: "packed", label: "Packed" },
    { key: "shipped", label: "Shipped" },
    { key: "out_for_delivery", label: "Out for Delivery" },
    { key: "delivered", label: "Delivered" }
  ];
  return labels.map((step, index) => ({
    ...step,
    complete: rank >= index,
    current: rank === index
  }));
}

export function formatOrderAddress(address?: OrderAddress) {
  if (!address) return "Delivery address unavailable";
  return [address.house, address.area, address.landmark, address.city, address.state, address.pincode].filter(Boolean).join(", ");
}

export function paymentMethodLabel(method?: string) {
  const labels: Record<string, string> = {
    razorpay_upi: "Razorpay UPI",
    google_pay: "Google Pay",
    phonepe: "PhonePe",
    paytm: "Paytm",
    credit_card: "Credit Card",
    debit_card: "Debit Card",
    net_banking: "Net Banking",
    cash_on_delivery: "Cash on Delivery"
  };
  return labels[method || ""] || "Online Payment";
}

export function whatsappOrderConfirmation(order: PersistedOrder) {
  const items = (order.order_items || []).map((item) => `${item.productName} x ${item.quantity}`).join(", ") || order.product_name;
  return [
    `Namaste, I need support for order ${order.id}.`,
    `Products: ${items}`,
    `Amount: ₹${(order.amount_paise / 100).toLocaleString("en-IN")}`,
    `Delivery: ${formatOrderAddress(order.delivery_address)}`,
    `Estimated delivery: ${order.estimated_delivery_date || "To be confirmed"}`
  ].join("\n");
}

export function orderItemsTotal(items: OrderItem[]) {
  return items.reduce((total, item) => total + item.unitPricePaise * item.quantity, 0);
}
