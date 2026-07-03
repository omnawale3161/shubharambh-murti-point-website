import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/backend/auth";
import { parseCategory } from "@/lib/backend/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("categories").select("*").eq("is_active", true).order("sort_order");
    return error ? NextResponse.json({ error: "Categories are temporarily unavailable." }, { status: 503 }) : NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Categories are temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const input = parseCategory(await request.json() as Record<string, unknown>);
  if (!input) return NextResponse.json({ error: "Invalid category data." }, { status: 400 });
  const { data, error } = await admin.supabase.from("categories").insert(input).select().single();
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data, { status: 201 });
}
