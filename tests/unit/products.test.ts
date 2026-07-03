import { describe, expect, it } from "vitest";
import {
  calculateLineTotal,
  calculateProductTotal,
  deliveryEstimate,
  GIFT_BOX_PRICE,
  isLegacyUuidSlug,
  isValidProductId,
  isValidProductSlug,
  productPath,
  products
} from "@/lib/products";

describe("product domain", () => {
  it("keeps permanent IDs and slugs unique and valid", () => {
    expect(new Set(products.map((product) => product.id)).size).toBe(products.length);
    expect(new Set(products.map((product) => product.slug)).size).toBe(products.length);
    expect(products.every((product) => isValidProductId(product.id))).toBe(true);
    expect(products.every((product) => isValidProductSlug(product.slug))).toBe(true);
  });

  it("calculates trusted product and line totals", () => {
    const product = products[0];

    expect(calculateProductTotal(product)).toBe(product.price);
    expect(calculateProductTotal(product, true)).toBe(product.price + GIFT_BOX_PRICE);
    expect(calculateLineTotal(product, 3, true)).toBe((product.price + GIFT_BOX_PRICE) * 3);
  });

  it("returns delivery guidance only for valid pincodes", () => {
    expect(deliveryEstimate("411001")).toContain("Pune");
    expect(deliveryEstimate("400001")).toContain("Mumbai");
    expect(deliveryEstimate("invalid")).toBeNull();
  });

  it("recognizes legacy UUID URLs and builds stable product paths", () => {
    expect(isLegacyUuidSlug("4d36e967-e325-4fd8-9f4f-4e0b1c2d3a4b")).toBe(true);
    expect(isLegacyUuidSlug(products[0].slug)).toBe(false);
    expect(productPath(products[0].slug)).toBe(`/products/${products[0].slug}`);
  });
});
