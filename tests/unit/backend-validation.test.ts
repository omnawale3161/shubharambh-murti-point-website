import { describe, expect, it } from "vitest";
import { parseCategory, parseContact, parseProduct, slugify } from "@/lib/backend/validation";

describe("backend validation", () => {
  it("creates stable URL slugs", () => {
    expect(slugify("Premium Ganpati Murti 4 Inch")).toBe("premium-ganpati-murti-4-inch");
  });

  it("rejects invalid product prices", () => {
    expect(parseProduct({ name: "Murti", price_paise: -1, stock_count: 1 })).toBeNull();
    expect(parseProduct({ name: "Murti", price_paise: 1000, compare_at_price_paise: 500, stock_count: 1 })).toBeNull();
  });

  it("requires a stable inventory SKU", () => {
    expect(parseProduct({ name: "Murti", price_paise: 1000, stock: 5 })).toBeNull();
    expect(parseProduct({ name: "Murti", sku: "SMP-001", price_paise: 1000, stock: 5 })).toMatchObject({ sku: "smp-001", stock: 5 });
  });

  it("normalizes valid categories", () => {
    expect(parseCategory({ name: "Ganpati Murti", sort_order: 2, is_active: "on" })).toMatchObject({
      slug: "ganpati-murti",
      sort_order: 2,
      is_active: true
    });
  });

  it("validates public contact submissions", () => {
    expect(parseContact({ name: "Om Nawale", phone: "7796675304", message: "Please share current Ganpati designs." })).toMatchObject({ status: "new" });
    expect(parseContact({ name: "O", phone: "123", message: "Hi" })).toBeNull();
  });
});
