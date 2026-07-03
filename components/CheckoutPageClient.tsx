"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CreditCard, Landmark, Smartphone, Truck } from "lucide-react";
import { getProductById, formatPrice } from "@/lib/products";
import { calculateCheckoutPricing, type CartItem, type CheckoutAddress, type PaymentMethod } from "@/lib/shop";
import { useShop } from "@/components/ShopProvider";
import { PincodeChecker } from "@/components/pincode-checker";
import { OrderConfirmationModal } from "@/components/orders/OrderConfirmationModal";

type CheckoutOrder = {
  internalOrderId: string;
  accessToken: string;
  razorpayOrderId?: string;
  keyId?: string;
  amount?: number;
  currency?: "INR";
  productName?: string;
  paymentMethod: PaymentMethod;
  status?: string;
  totalAmount: number;
  estimatedDeliveryDate: string;
};

type RazorpaySuccess = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayOptions = {
  key: string; amount: number; currency: string; name: string; description: string; image: string; order_id: string;
  handler: (response: RazorpaySuccess) => void; theme: { color: string }; modal: { ondismiss: () => void };
  prefill: { name: string; email: string; contact: string };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

const paymentMethods: { id: PaymentMethod; label: string; detail: string; icon: typeof Smartphone }[] = [
  { id: "razorpay_upi", label: "Razorpay UPI", detail: "Pay using any UPI app", icon: Smartphone },
  { id: "google_pay", label: "Google Pay", detail: "Complete payment through Razorpay", icon: Smartphone },
  { id: "phonepe", label: "PhonePe", detail: "Complete payment through Razorpay", icon: Smartphone },
  { id: "paytm", label: "Paytm", detail: "Complete payment through Razorpay", icon: Smartphone },
  { id: "credit_card", label: "Credit Card", detail: "Visa, Mastercard, RuPay and more", icon: CreditCard },
  { id: "debit_card", label: "Debit Card", detail: "Secure card payment through Razorpay", icon: CreditCard },
  { id: "net_banking", label: "Net Banking", detail: "All major Indian banks", icon: Landmark },
  { id: "cash_on_delivery", label: "Cash on Delivery", detail: "Pay when your order arrives", icon: Truck }
];

async function responseJson<T>(response: Response) {
  const body = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(body.error || "Checkout request failed.");
  return body;
}

export function CheckoutPageClient() {
  const searchParams = useSearchParams();
  const { cart, clearCart, isHydrated } = useShop();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay_upi");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<CheckoutOrder | null>(null);

  const checkoutItems = useMemo<CartItem[]>(() => {
    const productId = searchParams.get("productId");
    if (!productId) return cart;
    const product = getProductById(productId);
    const quantity = Math.min(10, Math.max(1, Number(searchParams.get("quantity")) || 1));
    return product ? [{ productId, product, quantity, options: { giftBox: searchParams.get("giftBox") === "true" } }] : [];
  }, [cart, searchParams]);
  const isBuyNow = Boolean(searchParams.get("productId"));
  const pricing = calculateCheckoutPricing(checkoutItems);
  const totalQuantity = checkoutItems.reduce((sum, item) => sum + item.quantity, 0);

  async function loadRazorpay() {
    if (window.Razorpay) return;
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Secure payment could not load."));
      document.head.appendChild(script);
    });
  }

  async function verifyPayment(order: CheckoutOrder, response: RazorpaySuccess) {
    await responseJson(await fetch("/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ internalOrderId: order.internalOrderId, razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature })
    }));
    if (!isBuyNow) clearCart();
    setConfirmedOrder(order);
  }

  async function submitCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!checkoutItems.length || isSubmitting) return;
    setIsSubmitting(true);
    setMessage("Creating your secure order...");
    const form = new FormData(event.currentTarget);
    const address = Object.fromEntries(["fullName", "mobile", "email", "house", "area", "landmark", "city", "state", "pincode"].map((key) => [key, String(form.get(key) || "")])) as CheckoutAddress;

    try {
      if (paymentMethod !== "cash_on_delivery") await loadRazorpay();
      const order = await responseJson<CheckoutOrder>(await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: checkoutItems.map((item) => ({ productId: item.productId, quantity: item.quantity, giftBox: item.options.giftBox })),
          address,
          paymentMethod
        })
      }));

      if (paymentMethod === "cash_on_delivery") {
        if (!isBuyNow) clearCart();
        setConfirmedOrder(order);
        return;
      }
      if (!window.Razorpay || !order.keyId || !order.amount || !order.razorpayOrderId) throw new Error("Secure payment could not start.");
      new window.Razorpay({
        key: order.keyId, amount: order.amount, currency: "INR", name: "Shubharambh Murti Point",
        description: order.productName || "Store order", image: "/assets/logo.png", order_id: order.razorpayOrderId,
        prefill: { name: address.fullName, email: address.email, contact: address.mobile },
        handler: (response) => void verifyPayment(order, response).catch((error: unknown) => { setMessage(error instanceof Error ? error.message : "Payment verification failed."); setIsSubmitting(false); }),
        theme: { color: "#780B22" },
        modal: { ondismiss: () => { setMessage("Payment window closed. Your payment was not completed."); setIsSubmitting(false); } }
      }).open();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Checkout is temporarily unavailable.");
      setIsSubmitting(false);
    }
  }

  if (!isHydrated && !isBuyNow) return <main className="premium-container py-16"><h1 className="text-4xl">Loading checkout...</h1></main>;
  if (!checkoutItems.length) return <main className="premium-container py-16"><h1 className="text-4xl">No products selected for checkout.</h1><Link href="/collections" className="btn btn-primary mt-6">Browse products</Link></main>;

  const field = "rounded-lg border border-outline-variant bg-white px-4 py-3 outline-hidden focus:border-primary";
  return (
    <>
    <main className="premium-container py-10 md:py-14">
      <p className="section-kicker">Secure Checkout</p>
      <h1 className="mt-2 text-4xl text-primary md:text-5xl">Complete your order</h1>
      <form onSubmit={submitCheckout} className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <section className="rounded-lg border border-outline-variant bg-white p-5 shadow-card">
            <h2 className="text-2xl font-bold text-primary">1. Delivery Address</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-bold">Full Name<input required name="fullName" autoComplete="name" minLength={2} className={field} /></label>
              <label className="grid gap-1 text-sm font-bold">Mobile Number<input required name="mobile" type="tel" autoComplete="tel" minLength={10} maxLength={20} className={field} /></label>
              <label className="grid gap-1 text-sm font-bold sm:col-span-2">Email<input required name="email" type="email" autoComplete="email" className={field} /></label>
              <label className="grid gap-1 text-sm font-bold">House / Flat<input required name="house" autoComplete="address-line1" className={field} /></label>
              <label className="grid gap-1 text-sm font-bold">Area / Street<input required name="area" autoComplete="address-line2" className={field} /></label>
              <label className="grid gap-1 text-sm font-bold">Landmark<input name="landmark" className={field} /></label>
              <label className="grid gap-1 text-sm font-bold">City<input required name="city" autoComplete="address-level2" className={field} /></label>
              <label className="grid gap-1 text-sm font-bold">State<input required name="state" autoComplete="address-level1" className={field} /></label>
              <label className="grid gap-1 text-sm font-bold">PIN Code<input required name="pincode" inputMode="numeric" pattern="[1-9][0-9]{5}" maxLength={6} autoComplete="postal-code" className={field} /></label>
            </div>
            <div className="mt-5 border-t border-outline-variant pt-5"><PincodeChecker compact /></div>
          </section>

          <section className="rounded-lg border border-outline-variant bg-white p-5 shadow-card">
            <h2 className="text-2xl font-bold text-primary">2. Payment Method</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {paymentMethods.map(({ id, label, detail, icon: Icon }) => <label key={id} className={`flex cursor-pointer gap-3 rounded-lg border p-4 ${paymentMethod === id ? "border-primary bg-surface-container-low" : "border-outline-variant"}`}><input type="radio" name="paymentMethodChoice" value={id} checked={paymentMethod === id} onChange={() => setPaymentMethod(id)} /><Icon size={20} className="shrink-0 text-primary" /><span><span className="block font-bold">{label}</span><span className="text-xs text-on-surface-variant">{detail}</span></span></label>)}
            </div>
          </section>
        </div>

        <aside className="grid h-fit gap-5 lg:sticky lg:top-28">
          <section className="rounded-lg border border-outline-variant bg-white p-5 shadow-card">
            <h2 className="text-xl font-bold text-primary">Order Summary</h2>
            <div className="mt-4 grid gap-4">{checkoutItems.map((item) => <div key={`${item.productId}-${item.options.giftBox}`} className="grid grid-cols-[72px_1fr] gap-3 border-t border-outline-variant pt-4"><div className="relative aspect-square overflow-hidden rounded-lg bg-surface-container"><Image src={item.product.image} alt={item.product.name} fill sizes="72px" className="object-cover" /></div><div><p className="font-bold">{item.product.name}</p><p className="text-sm text-on-surface-variant">Qty: {item.quantity}{item.options.giftBox ? " · Gift box" : ""}</p><p className="mt-1 font-bold text-primary">{formatPrice(item.product.price * item.quantity)}</p></div></div>)}</div>
          </section>
          <section className="rounded-lg border border-outline-variant bg-white p-5 shadow-card">
            <h2 className="text-xl font-bold text-primary">Price Details</h2>
            <dl className="mt-4 grid gap-3 text-sm"><div className="flex justify-between"><dt>Product Price</dt><dd>{formatPrice(pricing.productPrice)}</dd></div><div className="flex justify-between"><dt>Quantity</dt><dd>{totalQuantity}</dd></div><div className="flex justify-between"><dt>Shipping:</dt><dd className="font-bold text-green-700">FREE</dd></div><div className="flex justify-between"><dt>Discount</dt><dd className="text-green-700">- {formatPrice(pricing.discount)}</dd></div><div className="flex justify-between border-t border-outline-variant pt-3"><dt>Total Amount</dt><dd>{formatPrice(pricing.totalAmount)}</dd></div><div className="flex justify-between border-t border-outline-variant pt-3 text-lg font-black"><dt>Grand Total</dt><dd>{formatPrice(pricing.grandTotal)}</dd></div></dl>
            <button disabled={isSubmitting} className="btn btn-primary mt-5 w-full disabled:opacity-50">{isSubmitting ? "Placing order..." : paymentMethod === "cash_on_delivery" ? "Place COD Order" : `Pay ${formatPrice(pricing.grandTotal)}`}</button>
            {message ? <p role="status" className="mt-4 text-sm font-bold text-primary">{message}</p> : null}
          </section>
        </aside>
      </form>
    </main>
    {confirmedOrder ? <OrderConfirmationModal order={confirmedOrder} /> : null}
    </>
  );
}
