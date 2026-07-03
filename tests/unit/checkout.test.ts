import { describe, expect, it } from "vitest";
import { products } from "@/lib/products";
import { calculateCheckoutPricing } from "@/lib/shop";
import { parseOrderRequest } from "@/lib/payments";

describe("checkout", () => {
  it("keeps delivery free for authoritative cart lines", () => {
    const product = products[0];
    expect(calculateCheckoutPricing([{ productId: product.id, product, quantity: 1, options: { giftBox: false } }])).toMatchObject({
      productPrice: product.price,
      shippingCharge: 0,
      totalAmount: product.price,
      grandTotal: product.price
    });
  });

  it("accepts a valid Maharashtra checkout request", () => {
    expect(parseOrderRequest({
      items: [{ productId: products[0].id, quantity: 2, giftBox: false }],
      paymentMethod: "cash_on_delivery",
      address: {
        fullName: "Om Nawale",
        mobile: "7796675304",
        email: "om@example.com",
        house: "Flat 1",
        area: "Main Road",
        landmark: "",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411001"
      }
    })).not.toBeNull();
  });

  it("accepts valid checkout requests across India", () => {
    expect(parseOrderRequest({
      items: [{ productId: products[0].id, quantity: 1 }],
      paymentMethod: "razorpay_upi",
      address: {
        fullName: "Test Customer",
        mobile: "9999999999",
        email: "test@example.com",
        house: "12",
        area: "Road",
        city: "Delhi",
        state: "Delhi",
        pincode: "110001"
      }
    })).not.toBeNull();
  });
});
