import { NextResponse } from "next/server";
import {
  getCheckoutConfig,
  getOrderById,
  getRazorpayPayment,
  parsePaymentVerification,
  markOrderConfirmationSent,
  updateOrderByRazorpayOrderId,
  verifyPaymentSignature
} from "@/lib/payments";
import { sendOrderNotifications } from "@/lib/orders/email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const input = parsePaymentVerification(await request.json());
    if (!input) {
      return NextResponse.json({ error: "Invalid payment verification request." }, { status: 400 });
    }

    const config = getCheckoutConfig();
    const order = await getOrderById(input.internalOrderId, config);
    if (!order || order.razorpay_order_id !== input.razorpayOrderId) {
      return NextResponse.json({ error: "Order could not be verified." }, { status: 404 });
    }

    const signatureValid = verifyPaymentSignature({
      orderId: input.razorpayOrderId,
      paymentId: input.razorpayPaymentId,
      signature: input.razorpaySignature,
      secret: config.razorpayKeySecret
    });

    if (!signatureValid) {
      return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
    }

    const payment = await getRazorpayPayment(input.razorpayPaymentId, config);
    const paymentMatchesOrder =
      payment.order_id === order.razorpay_order_id &&
      payment.amount === order.amount_paise &&
      payment.currency === order.currency &&
      ["authorized", "captured"].includes(payment.status);

    if (!paymentMatchesOrder) {
      return NextResponse.json({ error: "Payment details do not match the secure order." }, { status: 400 });
    }

    await updateOrderByRazorpayOrderId({
      razorpayOrderId: order.razorpay_order_id,
      paymentId: payment.id,
      status: payment.status === "captured" ? "paid" : "payment_authorized",
      credentials: config
    });
    const updatedOrder = { ...order, razorpay_payment_id: payment.id, status: payment.status === "captured" ? "paid" as const : "payment_authorized" as const };
    if (!order.confirmation_sent_at && await sendOrderNotifications(updatedOrder)) {
      await markOrderConfirmationSent(order.id, config);
    }

    return NextResponse.json({
      verified: true,
      status: payment.status === "captured" ? "paid" : "payment_authorized"
    });
  } catch (error) {
    console.error("Payment verification failed", error);
    return NextResponse.json({ error: "Payment verification is temporarily unavailable." }, { status: 503 });
  }
}
