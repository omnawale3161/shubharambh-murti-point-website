import { hashOrderAccessToken } from "@/lib/orders";
import type { Product } from "@/lib/products";
import type { OrderStatus, PersistedOrder } from "./types";

type SupabaseCredentials = {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
};

type SupabaseErrorBody = {
  code?: string;
  details?: string | null;
  hint?: string | null;
  message?: string;
};

export class SupabaseOrderPersistenceError extends Error {
  constructor(
    public readonly status: number,
    public readonly databaseCode: string | undefined,
    message: string,
    public readonly details?: string | null,
    public readonly hint?: string | null
  ) {
    super(message);
    this.name = "SupabaseOrderPersistenceError";
  }
}

async function supabaseRequest<T>(
  path: string,
  credentials: SupabaseCredentials,
  init?: RequestInit
) {
  const response = await fetch(`${credentials.supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: credentials.supabaseServiceRoleKey,
      Authorization: `Bearer ${credentials.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      ...init?.headers
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as SupabaseErrorBody;
    throw new SupabaseOrderPersistenceError(
      response.status,
      body.code,
      body.message || `Supabase order persistence failed with status ${response.status}`,
      body.details,
      body.hint
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function assertCheckoutOrderSchema(credentials: SupabaseCredentials) {
  await supabaseRequest<unknown[]>(
    "orders?select=id,customer_id,quantity,order_items,delivery_address,payment_method,shipping_paise,discount_paise&limit=1",
    credentials
  );
}

export async function assertPostCheckoutOrderSchema(credentials: SupabaseCredentials) {
  await supabaseRequest<unknown[]>(
    "orders?select=id,tracking_number,estimated_delivery_date,shipped_at,delivered_at,customer_phone,customer_email,invoice_url,access_token_hash,confirmation_sent_at&limit=1",
    credentials
  );
}

export async function assertInventorySchema(credentials: SupabaseCredentials) {
  await supabaseRequest<unknown[]>(
    "products?select=id,sku,stock,reserved_stock,low_stock_threshold&limit=1",
    credentials
  );
}

type InventoryProductRow = {
  id: string;
  sku: string | null;
  slug: string;
  stock: number;
  reserved_stock: number;
  is_active: boolean;
};

const defaultCatalogStock = 25;

async function getInventoryProduct(product: Product, credentials: SupabaseCredentials) {
  const bySku = await supabaseRequest<InventoryProductRow[]>(
    `products?sku=eq.${encodeURIComponent(product.id)}&select=id,sku,slug,stock,reserved_stock,is_active&limit=1`,
    credentials
  );
  if (bySku[0]) return bySku[0];

  const bySlug = await supabaseRequest<InventoryProductRow[]>(
    `products?slug=eq.${encodeURIComponent(product.slug)}&select=id,sku,slug,stock,reserved_stock,is_active&limit=1`,
    credentials
  );
  return bySlug[0];
}

export async function ensureInventoryProducts(products: Product[], credentials: SupabaseCredentials) {
  const uniqueProducts = [...new Map(products.map((product) => [product.id, product])).values()];

  await Promise.all(uniqueProducts.map(async (product) => {
    const existing = await getInventoryProduct(product, credentials);

    if (existing) {
      const updates: { sku?: string; stock?: number; stock_count?: number; is_active?: boolean } = {};
      if (existing.sku !== product.id) {
        updates.sku = product.id;
      }
      if (existing.stock - existing.reserved_stock <= 0) {
        const repairedStock = existing.reserved_stock + defaultCatalogStock;
        updates.stock = repairedStock;
        updates.stock_count = repairedStock;
      }
      if (!existing.is_active) {
        updates.is_active = true;
      }
      if (Object.keys(updates).length) {
        await supabaseRequest<void>(`products?id=eq.${encodeURIComponent(existing.id)}`, credentials, {
          method: "PATCH",
          body: JSON.stringify(updates)
        });
      }
      return;
    }

    const initialStock = defaultCatalogStock;
    await supabaseRequest<void>("products", credentials, {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        sku: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price_paise: product.price * 100,
        stock_count: initialStock,
        stock: initialStock,
        reserved_stock: 0,
        low_stock_threshold: 5,
        image_url: product.image,
        material: product.material,
        size: product.size,
        badge: product.badge,
        is_active: true,
        is_featured: false
      })
    });
  }));
}

export async function reserveOrderInventory(id: string, credentials: SupabaseCredentials) {
  return supabaseRequest<void>("rpc/reserve_order_inventory", credentials, {
    method: "POST",
    body: JSON.stringify({ target_order_id: id })
  });
}

export async function createOrder(order: PersistedOrder, credentials: SupabaseCredentials) {
  const rows = await supabaseRequest<PersistedOrder[]>("orders", credentials, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(order)
  });
  return rows[0];
}

export async function getOrderById(id: string, credentials: SupabaseCredentials) {
  const rows = await supabaseRequest<PersistedOrder[]>(
    `orders?id=eq.${encodeURIComponent(id)}&select=*`,
    credentials
  );
  return rows[0];
}

export async function getOrderByRazorpayOrderId(id: string, credentials: SupabaseCredentials) {
  const rows = await supabaseRequest<PersistedOrder[]>(
    `orders?razorpay_order_id=eq.${encodeURIComponent(id)}&select=*`,
    credentials
  );
  return rows[0];
}

export async function getPublicOrder(id: string, accessToken: string, credentials: SupabaseCredentials) {
  const rows = await supabaseRequest<PersistedOrder[]>(
    `orders?id=eq.${encodeURIComponent(id)}&access_token_hash=eq.${hashOrderAccessToken(accessToken)}&select=*`,
    credentials
  );
  return rows[0];
}

export async function listOrders(credentials: SupabaseCredentials, query = "") {
  const orders = await supabaseRequest<PersistedOrder[]>(
    "orders?select=*&order=created_at.desc&limit=200",
    credentials
  );
  const normalized = query.trim().toLowerCase();
  return normalized
    ? orders.filter((order) => [order.id, order.product_name, order.customer_email, order.customer_phone].some((value) => value?.toLowerCase().includes(normalized)))
    : orders;
}

export async function updateOrderStatus({
  id,
  status,
  trackingNumber,
  credentials
}: {
  id: string;
  status: OrderStatus;
  trackingNumber?: string;
  credentials: SupabaseCredentials;
}) {
  return supabaseRequest<void>("rpc/set_order_status_with_inventory", credentials, {
    method: "POST",
    body: JSON.stringify({
      target_order_id: id,
      next_status: status,
      next_tracking_number: trackingNumber || null
    })
  });
}

export async function markOrderConfirmationSent(id: string, credentials: SupabaseCredentials) {
  return supabaseRequest<void>(`orders?id=eq.${encodeURIComponent(id)}`, credentials, {
    method: "PATCH",
    body: JSON.stringify({ confirmation_sent_at: new Date().toISOString() })
  });
}

export async function updateOrderByRazorpayOrderId({
  razorpayOrderId,
  status,
  paymentId,
  credentials
}: {
  razorpayOrderId: string;
  status: OrderStatus;
  paymentId?: string;
  credentials: SupabaseCredentials;
}) {
  return supabaseRequest<void>(
    `orders?razorpay_order_id=eq.${encodeURIComponent(razorpayOrderId)}`,
    credentials,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
        ...(paymentId ? { razorpay_payment_id: paymentId } : {}),
        updated_at: new Date().toISOString()
      })
    }
  );
}

export async function recordPaymentEvent({
  eventId,
  eventType,
  payload,
  credentials
}: {
  eventId: string;
  eventType: string;
  payload: unknown;
  credentials: SupabaseCredentials;
}) {
  return supabaseRequest<void>("payment_events", credentials, {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates" },
    body: JSON.stringify({
      id: eventId,
      event_type: eventType,
      payload
    })
  });
}
