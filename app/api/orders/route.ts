import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProductById } from "@/lib/products";
import { calculateCheckoutPricing, type CartItem } from "@/lib/shop";
import { createOrderAccessToken, estimatedDeliveryDate } from "@/lib/orders";
import { sendOrderNotifications } from "@/lib/orders/email";
import {
  assertCheckoutOrderSchema,
  assertInventorySchema,
  assertPostCheckoutOrderSchema,
  createOrder,
  createRazorpayOrder,
  ensureInventoryProducts,
  getCheckoutConfig,
  getOrderPersistenceConfig,
  markOrderConfirmationSent,
  PaymentConfigurationError,
  parseOrderRequest,
  RazorpayApiError,
  reserveOrderInventory,
  SupabaseOrderPersistenceError
} from "@/lib/payments";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const input = parseOrderRequest(await request.json());
    if (!input) {
      return NextResponse.json({ error: "Invalid order request." }, { status: 400 });
    }

    const cart = input.items.flatMap<CartItem>((item) => {
      const product = getProductById(item.productId);
      return product ? [{ productId: product.id, quantity: item.quantity, options: { giftBox: item.giftBox }, product }] : [];
    });
    if (cart.length !== input.items.length) {
      return NextResponse.json({ error: "Product is unavailable." }, { status: 404 });
    }

    const session = await auth();
    const internalOrderId = randomUUID();
    const access = createOrderAccessToken();
    const deliveryDate = estimatedDeliveryDate();
    const pricing = calculateCheckoutPricing(cart);
    const amountPaise = pricing.grandTotal * 100;
    const productSummary = cart.length === 1 ? cart[0].product.name : `${cart.length} products`;
    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      productSlug: item.product.slug,
      productName: item.product.name,
      unitPricePaise: item.product.price * 100,
      quantity: item.quantity,
      giftBox: item.options.giftBox
    }));
    const isCod = input.paymentMethod === "cash_on_delivery";
    const persistenceConfig = getOrderPersistenceConfig();
    await assertCheckoutOrderSchema(persistenceConfig);
    await assertPostCheckoutOrderSchema(persistenceConfig);
    await assertInventorySchema(persistenceConfig);
    await ensureInventoryProducts(cart.map((item) => item.product), persistenceConfig);

    if (isCod) {
      const order = await createOrder({
        id: internalOrderId,
        razorpay_order_id: `cod_${internalOrderId}`,
        razorpay_payment_id: null,
        customer_id: session?.user?.id || null,
        product_id: cart[0].product.id,
        product_name: productSummary,
        amount_paise: amountPaise,
        currency: "INR",
        gift_box: cart.some((item) => item.options.giftBox),
        quantity: cart.reduce((sum, item) => sum + item.quantity, 0),
        order_items: orderItems,
        delivery_address: input.address,
        payment_method: input.paymentMethod,
        shipping_paise: 0,
        discount_paise: pricing.discount * 100,
        estimated_delivery_date: deliveryDate,
        customer_phone: input.address.mobile,
        customer_email: input.address.email,
        invoice_url: `/api/orders/${internalOrderId}/invoice`,
        access_token_hash: access.hash,
        status: "cod_pending"
      }, persistenceConfig);
      await reserveOrderInventory(order.id, persistenceConfig);
      if (await sendOrderNotifications(order)) await markOrderConfirmationSent(order.id, persistenceConfig);
      return NextResponse.json({
        internalOrderId,
        accessToken: access.token,
        paymentMethod: "cash_on_delivery",
        status: "cod_pending",
        totalAmount: pricing.grandTotal,
        estimatedDeliveryDate: deliveryDate
      }, { status: 201 });
    }

    const config = getCheckoutConfig();
    const razorpayOrder = await createRazorpayOrder({
      amountPaise,
      receipt: internalOrderId,
      notes: {
        internalOrderId,
        itemCount: String(cart.length),
        paymentMethod: input.paymentMethod
      },
      ...config
    });

    const persistedOrder = await createOrder(
      {
        id: internalOrderId,
        razorpay_order_id: razorpayOrder.id,
        razorpay_payment_id: null,
        customer_id: session?.user?.id || null,
        product_id: cart[0].product.id,
        product_name: productSummary,
        amount_paise: amountPaise,
        currency: "INR",
        gift_box: cart.some((item) => item.options.giftBox),
        quantity: cart.reduce((sum, item) => sum + item.quantity, 0),
        order_items: orderItems,
        delivery_address: input.address,
        payment_method: input.paymentMethod,
        shipping_paise: 0,
        discount_paise: pricing.discount * 100,
        estimated_delivery_date: deliveryDate,
        customer_phone: input.address.mobile,
        customer_email: input.address.email,
        invoice_url: `/api/orders/${internalOrderId}/invoice`,
        access_token_hash: access.hash,
        status: "created"
      },
      config
    );
    await reserveOrderInventory(persistedOrder.id, config);

    return NextResponse.json({
      internalOrderId,
      razorpayOrderId: razorpayOrder.id,
      keyId: config.razorpayKeyId,
      amount: amountPaise,
      currency: "INR",
      productName: productSummary,
      paymentMethod: input.paymentMethod,
      accessToken: access.token,
      totalAmount: pricing.grandTotal,
      estimatedDeliveryDate: deliveryDate
    });
  } catch (error) {
    console.error("Secure order creation failed", error);
    if (error instanceof PaymentConfigurationError) {
      const message = process.env.NODE_ENV === "development"
        ? `Secure checkout needs server configuration. Add ${error.missingVariables.join(" and ")} to .env.local, then restart the development server.`
        : "Secure online checkout is temporarily unavailable. Please order on WhatsApp.";
      return NextResponse.json({ error: message }, { status: 503 });
    }
    if (error instanceof SupabaseOrderPersistenceError) {
      if (error.databaseCode === "P0001" && /stock|Inventory product/i.test(error.message)) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      const inventoryMigrationMissing = /sku|stock|reserved_stock|low_stock_threshold|reserve_order_inventory/.test(error.message);
      const postCheckoutColumnMissing = /tracking_number|estimated_delivery_date|customer_phone|access_token_hash|confirmation_sent_at/.test(error.message);
      const message = process.env.NODE_ENV === "development" && error.databaseCode === "42703"
        ? `Checkout database migration is missing. Apply supabase/migrations/${inventoryMigrationMissing ? "005_inventory_management.sql" : postCheckoutColumnMissing ? "004_post_checkout.sql" : "003_checkout.sql"} in the Supabase SQL Editor, then try again.`
        : "Secure online checkout is temporarily unavailable. Please order on WhatsApp.";
      return NextResponse.json({ error: message }, { status: 503 });
    }
    if (error instanceof RazorpayApiError) {
      const message = process.env.NODE_ENV === "development"
        ? `Razorpay order creation failed with status ${error.status}. Check that RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET belong to the same Razorpay mode/account.`
        : "Secure online checkout is temporarily unavailable. Please order on WhatsApp.";
      return NextResponse.json({ error: message }, { status: 503 });
    }
    return NextResponse.json(
      { error: "Secure online checkout is temporarily unavailable. Please order on WhatsApp." },
      { status: 503 }
    );
  }
}
