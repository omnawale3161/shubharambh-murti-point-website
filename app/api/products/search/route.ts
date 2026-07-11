import { NextResponse } from "next/server";
import { getStorefrontProducts } from "@/lib/products/storefront";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() || "";
  const limit = query ? 8 : 6;
  const products = await getStorefrontProducts();
  const matches = products
    .filter((product) => {
      if (!query) return true;
      return `${product.name} ${product.collection} ${product.size} ${product.material}`
        .toLowerCase()
        .includes(query);
    })
    .slice(0, limit)
    .map(({ id, slug, name, collection, size, image, price }) => ({
      id,
      slug,
      name,
      collection,
      size,
      image,
      price
    }));

  return NextResponse.json(matches, {
    headers: {
      "Cache-Control": query
        ? "public, s-maxage=300, stale-while-revalidate=3600"
        : "public, s-maxage=3600, stale-while-revalidate=86400"
    }
  });
}
