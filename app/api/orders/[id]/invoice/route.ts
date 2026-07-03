import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createInvoicePdf } from "@/lib/orders/invoice";
import { getOrderPersistenceConfig, getPublicOrder } from "@/lib/payments";
import { getOrderById } from "@/lib/payments";
import { requireAdminApi } from "@/lib/backend/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = new URL(request.url).searchParams.get("token");
  const credentials = getOrderPersistenceConfig();
  const session = token ? null : await auth();
  const order = token ? await getPublicOrder(id, token, credentials) : await getOrderById(id, credentials);
  const canAccessOrder = token || (order?.customer_id && order.customer_id === session?.user?.id) || await requireAdminApi();
  if (!canAccessOrder) return NextResponse.json({ error: "Invoice access token is required." }, { status: 401 });
  if (!token && !order) return NextResponse.json({ error: "Invoice access token is required." }, { status: 401 });
  if (!order) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  return new NextResponse(createInvoicePdf(order), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="SMP-${order.id.slice(0, 8)}-invoice.pdf"`,
      "Cache-Control": "private, no-store"
    }
  });
}
