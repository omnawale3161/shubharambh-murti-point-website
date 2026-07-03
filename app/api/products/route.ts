import { NextResponse } from "next/server";
import { products } from "@/lib/products";
import { readDecor, readFrames, readIdols } from "@/lib/excel";
import { requireAdminApi } from "@/lib/backend/auth";
import { parseProduct } from "@/lib/backend/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const query = searchParams.get("q")?.trim().toLowerCase();
  const source = searchParams.get("source");

  if (source === "excel") {
    return NextResponse.json([
      ...(await readIdols()).map((product) => ({ ...product, _type: "idol" })),
      ...(await readFrames()).map((product) => ({ ...product, _type: "frame" })),
      ...(await readDecor()).map((product) => ({ ...product, _type: "decor" }))
    ]);
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createSupabaseServerClient();
    let databaseQuery = supabase.from("products").select("*, categories(name, slug)").eq("is_active", true).order("created_at", { ascending: false });
    if (category && category !== "All") databaseQuery = databaseQuery.eq("categories.slug", category);
    if (query) databaseQuery = databaseQuery.ilike("name", `%${query.replace(/[%_,().]/g, "")}%`);
    const { data, error } = await databaseQuery;
    if (!error && data?.length) return NextResponse.json(data);
  }

  const results = products.filter((product) => {
    const matchesCategory = !category || category === "All" || product.collection === category;
    const matchesQuery = !query || `${product.name} ${product.description} ${product.collection}`.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  return NextResponse.json(results, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" }
  });
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const input = parseProduct(await request.json() as Record<string, unknown>);
  if (!input) return NextResponse.json({ error: "Invalid product data." }, { status: 400 });
  const { data, error } = await admin.supabase.from("products").insert(input).select().single();
  return error
    ? NextResponse.json({ error: error.message }, { status: 400 })
    : NextResponse.json(data, { status: 201 });
}
