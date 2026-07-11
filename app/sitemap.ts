import type { MetadataRoute } from "next";
import { getStorefrontProducts } from "@/lib/products/storefront";
import { absoluteUrl } from "@/lib/seo";

const publicRoutes = [
  "/",
  "/about",
  "/collections",
  "/contact",
  "/privacy-policy",
  "/refund-policy",
  "/shipping-policy"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const products = await getStorefrontProducts();

  return [
    ...publicRoutes.map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: path === "/" || path === "/collections" ? "weekly" as const : "monthly" as const,
      priority: path === "/" ? 1 : path === "/collections" ? 0.9 : 0.5
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: [absoluteUrl(product.image)]
    }))
  ];
}
