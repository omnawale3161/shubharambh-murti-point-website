type JsonRecord = Record<string, unknown>;
import type { CheckoutAddress, PaymentMethod } from "@/lib/shop";

export function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseOrderRequest(value: unknown) {
  if (!isRecord(value) || !Array.isArray(value.items) || !isRecord(value.address)) return null;
  const items = value.items.flatMap((item) => {
    if (!isRecord(item) || typeof item.productId !== "string") return [];
    const quantity = typeof item.quantity === "number" ? Math.floor(item.quantity) : 0;
    return quantity >= 1 && quantity <= 99
      ? [{ productId: item.productId, quantity, giftBox: item.giftBox === true }]
      : [];
  });
  if (!items.length || items.length !== value.items.length || items.length > 25) return null;

  const clean = (input: unknown, max: number) => typeof input === "string" ? input.trim().replace(/\s+/g, " ").slice(0, max) : "";
  const address: CheckoutAddress = {
    fullName: clean(value.address.fullName, 80),
    mobile: clean(value.address.mobile, 20),
    email: clean(value.address.email, 254).toLowerCase(),
    house: clean(value.address.house, 120),
    area: clean(value.address.area, 160),
    landmark: clean(value.address.landmark, 120),
    city: clean(value.address.city, 80),
    state: clean(value.address.state, 80),
    pincode: clean(value.address.pincode, 6)
  };
  const paymentMethods: PaymentMethod[] = ["razorpay_upi", "google_pay", "phonepe", "paytm", "credit_card", "debit_card", "net_banking", "cash_on_delivery"];
  const paymentMethod = paymentMethods.includes(value.paymentMethod as PaymentMethod) ? value.paymentMethod as PaymentMethod : null;
  const validAddress =
    address.fullName.length >= 2 &&
    /^[+0-9][0-9\s-]{9,19}$/.test(address.mobile) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email) &&
    address.house.length >= 2 &&
    address.area.length >= 2 &&
    address.city.length >= 2 &&
    address.state.length >= 2 &&
    /^[1-9][0-9]{5}$/.test(address.pincode);

  return validAddress && paymentMethod ? { items, address, paymentMethod } : null;
}

export function parsePaymentVerification(value: unknown) {
  if (!isRecord(value)) return null;

  const keys = ["internalOrderId", "razorpayOrderId", "razorpayPaymentId", "razorpaySignature"] as const;
  if (keys.some((key) => typeof value[key] !== "string" || !value[key])) return null;

  const parsed = {
    internalOrderId: value.internalOrderId as string,
    razorpayOrderId: value.razorpayOrderId as string,
    razorpayPaymentId: value.razorpayPaymentId as string,
    razorpaySignature: value.razorpaySignature as string
  };

  const valid =
    /^[0-9a-f-]{36}$/i.test(parsed.internalOrderId) &&
    /^order_[A-Za-z0-9]+$/.test(parsed.razorpayOrderId) &&
    /^pay_[A-Za-z0-9]+$/.test(parsed.razorpayPaymentId) &&
    /^[0-9a-f]{64}$/i.test(parsed.razorpaySignature);

  return valid ? parsed : null;
}
