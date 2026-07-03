import { Product } from "./types";

export const GIFT_BOX_PRICE = 99;

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(price);
}

export function calculateProductTotal(product: Product, giftBox = false) {
  return product.price + (giftBox ? GIFT_BOX_PRICE : 0);
}

export function calculateLineTotal(product: Product, quantity: number, giftBox = false) {
  return calculateProductTotal(product, giftBox) * quantity;
}
