import "server-only";
import { supabaseServerRequest } from "@/lib/supabase/server";
import type { Customer, CustomerCredential, CustomerOrder } from "./types";

export async function getCustomerCredentialByEmail(email: string) {
  const rows = await supabaseServerRequest<CustomerCredential[]>(
    `customer_accounts?email=eq.${encodeURIComponent(email)}&select=id,name,email,phone,password_hash,created_at`
  );
  return rows[0];
}

export async function getCustomerById(id: string) {
  const rows = await supabaseServerRequest<Customer[]>(
    `customer_accounts?id=eq.${encodeURIComponent(id)}&select=id,name,email,phone,created_at`
  );
  return rows[0];
}

export async function createCustomer(customer: Omit<CustomerCredential, "created_at">) {
  const rows = await supabaseServerRequest<Customer[]>("customer_accounts", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(customer)
  });
  return rows[0];
}

export async function getCustomerOrders(customerId: string) {
  return supabaseServerRequest<CustomerOrder[]>(
    `orders?customer_id=eq.${encodeURIComponent(customerId)}&select=id,product_name,amount_paise,gift_box,status,payment_method,tracking_number,estimated_delivery_date,shipped_at,delivered_at,created_at&order=created_at.desc&limit=20`
  );
}
