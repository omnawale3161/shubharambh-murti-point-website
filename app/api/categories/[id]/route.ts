import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/backend/auth";
import { parseCategory } from "@/lib/backend/validation";
import { isPrimaryProductCategory } from "@/lib/products/categories";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const input = parseCategory(await request.json() as Record<string, unknown>);
  if (!input) return NextResponse.json({ error: "Invalid category data." }, { status: 400 });
  if (!isPrimaryProductCategory(input.name, input.slug)) {
    return NextResponse.json({ error: "Only primary product categories are allowed." }, { status: 400 });
  }
  const { id } = await params;
  const { data, error } = await admin.supabase.from("categories").update(input).eq("id", id).select().single();
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const { error } = await admin.supabase.from("categories").update({ is_active: false }).eq("id", id);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : new NextResponse(null, { status: 204 });
}
