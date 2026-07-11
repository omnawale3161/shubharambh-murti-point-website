import type { OrderStatus } from "@/lib/payments";

export const orderStatuses: readonly OrderStatus[] = [
  "created",
  "cod_pending",
  "payment_authorized",
  "paid",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "payment_failed"
];

export const paidOrderStatuses: ReadonlySet<OrderStatus> = new Set([
  "paid",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered"
]);

export const pendingOrderStatuses: ReadonlySet<OrderStatus> = new Set([
  "created",
  "cod_pending",
  "payment_authorized"
]);

export function orderStatusLabel(status: OrderStatus) {
  return status === "cod_pending" ? "Created · Cash on Delivery" : status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
