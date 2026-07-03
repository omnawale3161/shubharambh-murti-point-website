import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/backend/auth";
import { formatOrderAddress } from "@/lib/orders";
import { getOrderPersistenceConfig, listOrders } from "@/lib/payments";

function csv(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET() {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const orders = await listOrders(getOrderPersistenceConfig());
  const rows = [
    ["Order ID", "Created", "Status", "Customer", "Email", "Phone", "Products", "Amount INR", "Payment", "Tracking", "Estimated Delivery", "Address"],
    ...orders.map((order) => [order.id, order.created_at, order.status, order.delivery_address?.fullName, order.customer_email, order.customer_phone, order.product_name, order.amount_paise / 100, order.payment_method, order.tracking_number, order.estimated_delivery_date, formatOrderAddress(order.delivery_address)])
  ];
  return new NextResponse(rows.map((row) => row.map(csv).join(",")).join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"` }
  });
}

