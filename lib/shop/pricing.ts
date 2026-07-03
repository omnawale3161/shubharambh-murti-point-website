import { calculateLineTotal } from "@/lib/products";
import type { CartItem } from "./types";

export function calculateCartSubtotal(cart: readonly CartItem[]) {
  return cart.reduce(
    (total, item) => total + calculateLineTotal(item.product, item.quantity, item.options.giftBox),
    0
  );
}

export function calculateCheckoutPricing(cart: readonly CartItem[], discount = 0) {
  const productPrice = calculateCartSubtotal(cart);
  const safeDiscount = Math.max(0, Math.min(productPrice, discount));
  return {
    productPrice,
    shippingCharge: 0,
    discount: safeDiscount,
    totalAmount: productPrice,
    grandTotal: productPrice - safeDiscount
  };
}
