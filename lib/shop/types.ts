import type { Product } from "@/lib/products";

export type CartOptions = {
  giftBox: boolean;
};

export type CartSelection = {
  productId: string;
  quantity: number;
  options: CartOptions;
};

export type CartItem = CartSelection & {
  product: Product;
};

export type ShopState = {
  cart: CartSelection[];
  wishlistProductIds: string[];
};

export type CheckoutAddress = {
  fullName: string;
  mobile: string;
  email: string;
  house: string;
  area: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
};

export type PaymentMethod =
  | "razorpay_upi"
  | "google_pay"
  | "phonepe"
  | "paytm"
  | "credit_card"
  | "debit_card"
  | "net_banking"
  | "cash_on_delivery";
