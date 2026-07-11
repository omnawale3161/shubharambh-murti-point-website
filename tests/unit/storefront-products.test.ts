import { describe, expect, it } from "vitest";
import { products } from "@/lib/products";
import {
  databaseStorefrontProducts,
  mergeStorefrontProducts,
  type StorefrontCategoryRow,
  type StorefrontProductRow
} from "@/lib/products/storefront-merge";

const categoryRow: StorefrontCategoryRow = {
  id: "category-ganapati",
  name: "Ganapati Murti",
  slug: "ganapati-murti",
  description: "",
  image_url: null,
  is_active: true,
  sort_order: 1
};

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
    image_urls: row.image_urls ?? [],
    material: row.material || "Marble dust finish",
    size: row.size || "6 inch",
    badge: row.badge || "New",
    is_active: row.is_active ?? true,
    categories: row.categories ?? categoryRow
  };
}

describe("storefront product merge", () => {
  it("uses active database products as the admin-managed storefront list", () => {
    const storefrontProducts = databaseStorefrontProducts([
      productRow({ id: "db-product-1", sku: "ganpati-001", slug: "admin-ganpati" }),
      productRow({ id: "db-product-2", sku: "hidden-001", slug: "hidden-product", is_active: false })
    ]);

    expect(storefrontProducts).toHaveLength(1);
    expect(storefrontProducts[0]).toMatchObject({
      id: "ganpati-001",
      slug: "admin-ganpati",
      name: "Admin Product"
    });
  });

  it("does not add the fallback logo to products that already have images", () => {
    const [product] = databaseStorefrontProducts([
      productRow({
        image_url: "https://example.com/front.jpg",
        image_urls: []
      })
    ]);

    expect(product.images).toEqual(["https://example.com/front.jpg"]);
  });

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
