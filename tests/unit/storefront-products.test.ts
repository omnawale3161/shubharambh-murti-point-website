import { describe, expect, it } from "vitest";
import { products } from "@/lib/products";
import { mergeStorefrontProducts, type StorefrontProductRow } from "@/lib/products/storefront-merge";

function productRow(row: Partial<StorefrontProductRow> = {}): StorefrontProductRow {
  return {
    id: row.id || "db-product-1",
    category_id: row.category_id ?? null,
    name: row.name || "Admin Product",
    slug: row.slug || "admin-product",
    description: row.description || "Admin product description",
    price_paise: row.price_paise ?? 123400,
    stock_count: row.stock_count ?? 10,
    sku: row.sku ?? null,
    image_url: row.image_url ?? null,
    material: row.material || "Marble dust finish",
    size: row.size || "6 inch",
    badge: row.badge || "New",
    is_active: row.is_active ?? true,
    categories: row.categories ?? { name: "Ganapati Murti", slug: "ganapati-murti" }
  };
}

describe("storefront product merge", () => {
  it("keeps the full catalog when only a small admin product set exists", () => {
    const merged = mergeStorefrontProducts(products, [
      productRow({ id: "db-product-1", slug: "admin-ganpati" }),
      productRow({ id: "db-product-2", slug: "admin-shivaji", name: "Admin Shivaji" })
    ]);

    expect(merged.length).toBe(products.length + 2);
    expect(merged.some((product) => product.id === products[0].id)).toBe(true);
    expect(merged.some((product) => product.slug === "admin-ganpati")).toBe(true);
  });

  it("overrides catalog products by sku without changing their stable storefront id", () => {
    const catalogProduct = products[0];
    const merged = mergeStorefrontProducts(products, [
      productRow({
        sku: catalogProduct.id,
        slug: catalogProduct.slug,
        name: "Updated Ganpati",
        price_paise: 150000
      })
    ]);

    const updated = merged.find((product) => product.id === catalogProduct.id);
    expect(merged.length).toBe(products.length);
    expect(updated).toMatchObject({
      id: catalogProduct.id,
      slug: catalogProduct.slug,
      name: "Updated Ganpati",
      price: 1500
    });
  });

  it("allows an inactive matching admin row to hide a catalog product", () => {
    const catalogProduct = products[0];
    const merged = mergeStorefrontProducts(products, [
      productRow({
        sku: catalogProduct.id,
        slug: catalogProduct.slug,
        is_active: false
      })
    ]);

    expect(merged).toHaveLength(products.length - 1);
    expect(merged.some((product) => product.id === catalogProduct.id)).toBe(false);
  });
});
