import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireAdminApi } from "@/lib/backend/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const file = (await request.formData()).get("file");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Choose an image." }, { status: 400 });
  if (file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
    return NextResponse.json({ error: "Use a JPG, PNG, WebP, or AVIF image up to 5 MB." }, { status: 400 });
  }
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${new Date().getUTCFullYear()}/${randomUUID()}.${extension}`;
  const { error } = await admin.supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const { data } = admin.supabase.storage.from("product-images").getPublicUrl(path);
  return NextResponse.json({ path, url: data.publicUrl }, { status: 201 });
}

