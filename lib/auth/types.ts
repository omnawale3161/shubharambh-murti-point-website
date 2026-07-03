import type { OrderStatus } from "@/lib/payments";

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at?: string;
};

export type CustomerCredential = Customer & {
  password_hash: string;
};

export type CustomerOrder = {
  id: string;
  product_name: string;
  amount_paise: number;
  gift_box: boolean;
  status: OrderStatus;
  payment_method?: string | null;
  tracking_number?: string | null;
  estimated_delivery_date?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  created_at: string;
};
