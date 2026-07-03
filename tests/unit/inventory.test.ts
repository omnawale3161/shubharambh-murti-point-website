import { describe, expect, it } from "vitest";
import { inventoryAvailability, salesReport } from "@/lib/inventory/domain";
import type { PersistedOrder } from "@/lib/payments";

describe("inventory domain", () => {
  it("uses unreserved stock for availability warnings", () => {
    expect(inventoryAvailability({ stock: 8, reserved_stock: 3, low_stock_threshold: 5 })).toMatchObject({
      availableStock: 5,
      isLowStock: true,
      isOutOfStock: false
    });
    expect(inventoryAvailability({ stock: 3, reserved_stock: 3, low_stock_threshold: 5 }).isOutOfStock).toBe(true);
  });

  it("only includes paid and fulfilled orders in sales reports", () => {
    const base = {
      id: "order-1", razorpay_order_id: "rzp-1", razorpay_payment_id: null, customer_id: null,
      product_id: "smp-001", product_name: "Ganpati", amount_paise: 10000, currency: "INR" as const,
      gift_box: false, order_items: [{ productId: "smp-001", productName: "Ganpati", unitPricePaise: 5000, quantity: 2, giftBox: false }],
      created_at: "2026-06-12T10:00:00.000Z"
    };
    const report = salesReport([{ ...base, status: "paid" }, { ...base, id: "order-2", status: "cancelled" }] as PersistedOrder[]);
    expect(report.bestSellers[0]).toMatchObject({ quantity: 2, revenuePaise: 10000 });
    expect(report.dailyRevenue).toEqual([["2026-06-12", 10000]]);
  });
});
