import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/backend/auth";
import { parseProduct } from "@/lib/backend/validation";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const { data, error } = await admin.supabase.from("products").select("*, categories(name, slug)").eq("id", id).single();
  return error ? NextResponse.json({ error: "Product not found." }, { status: 404 }) : NextResponse.json(data);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const input = parseProduct(await request.json() as Record<string, unknown>);
  if (!input) return NextResponse.json({ error: "Invalid product data." }, { status: 400 });
  const { id } = await params;
  const { data, error } = await admin.supabase.from("products").update(input).eq("id", id).select().single();
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const { error } = await admin.supabase.from("products").delete().eq("id", id);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : new NextResponse(null, { status: 204 });
}

