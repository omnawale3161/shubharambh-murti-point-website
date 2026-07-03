export type OrderStatus =
  | "created"
  | "cod_pending"
  | "payment_authorized"
  | "paid"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "payment_failed";

export type OrderItem = {
  productId: string;
  productSlug?: string;
  productName: string;
  unitPricePaise: number;
  quantity: number;
  giftBox: boolean;
};

export type OrderAddress = {
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

export type PersistedOrder = {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  customer_id: string | null;
  product_id: string;
  product_name: string;
  amount_paise: number;
  currency: "INR";
  gift_box: boolean;
  status: OrderStatus;
  quantity?: number;
  order_items?: OrderItem[];
  delivery_address?: OrderAddress;
  payment_method?: string;
  shipping_paise?: number;
  discount_paise?: number;
  tracking_number?: string | null;
  estimated_delivery_date?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  invoice_url?: string | null;
  access_token_hash?: string | null;
  confirmation_sent_at?: string | null;
  inventory_state?: "unreserved" | "reserved" | "committed" | "released";
  created_at?: string;
  updated_at?: string;
};

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: "INR";
  receipt: string;
  status: string;
};

export type RazorpayPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: "INR";
  status: string;
};
