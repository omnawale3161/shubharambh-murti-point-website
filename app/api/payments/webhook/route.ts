import { NextResponse } from "next/server";
import {
  getPaymentConfig,
  getOrderByRazorpayOrderId,
  isRecord,
  recordPaymentEvent,
  markOrderConfirmationSent,
  updateOrderByRazorpayOrderId,
  updateOrderStatus,
  verifyWebhookSignature
} from "@/lib/payments";
import { sendOrderNotifications } from "@/lib/orders/email";

export const runtime = "nodejs";

function getPaymentEntity(payload: unknown) {
  if (!isRecord(payload) || !isRecord(payload.payload) || !isRecord(payload.payload.payment)) return null;
  const entity = payload.payload.payment.entity;
  return isRecord(entity) ? entity : null;
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-razorpay-signature");
    const eventId = request.headers.get("x-razorpay-event-id");
    const rawPayload = await request.text();

    if (!signature || !eventId) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    const config = getPaymentConfig();
    if (!verifyWebhookSignature(rawPayload, signature, config.razorpayWebhookSecret)) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    const payload: unknown = JSON.parse(rawPayload);
    if (!isRecord(payload) || typeof payload.event !== "string") {
      return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
    }

    await recordPaymentEvent({
      eventId,
      eventType: payload.event,
      payload,
      credentials: config
    });

    const payment = getPaymentEntity(payload);
    if (payment && typeof payment.order_id === "string") {
      if (payload.event === "payment.captured") {
        await updateOrderByRazorpayOrderId({
          razorpayOrderId: payment.order_id,
          paymentId: typeof payment.id === "string" ? payment.id : undefined,
          status: "paid",
          credentials: config
        });
        const order = await getOrderByRazorpayOrderId(payment.order_id, config);
        if (order && !order.confirmation_sent_at && await sendOrderNotifications({ ...order, status: "paid" })) {
          await markOrderConfirmationSent(order.id, config);
        }
      } else if (payload.event === "payment.failed") {
        const order = await getOrderByRazorpayOrderId(payment.order_id, config);
        if (order) await updateOrderStatus({ id: order.id, status: "payment_failed", credentials: config });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook processing failed", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
