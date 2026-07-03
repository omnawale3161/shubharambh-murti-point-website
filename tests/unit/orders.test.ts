import { describe, expect, it } from "vitest";
import { formatOrderAddress, orderTimeline, paymentMethodLabel } from "@/lib/orders";

describe("order presentation", () => {
  it("builds the fulfilment timeline from status", () => {
    const shipped = orderTimeline("shipped");
    expect(shipped.map((step) => step.complete)).toEqual([true, true, true, false, false]);
    expect(shipped.find((step) => step.current)?.key).toBe("shipped");
  });

  it("formats delivery and payment details", () => {
    expect(formatOrderAddress({ fullName: "Om", mobile: "1", email: "a@b.com", house: "1", area: "Main Road", landmark: "", city: "Pune", state: "Maharashtra", pincode: "411001" })).toBe("1, Main Road, Pune, Maharashtra, 411001");
    expect(paymentMethodLabel("cash_on_delivery")).toBe("Cash on Delivery");
  });
});
