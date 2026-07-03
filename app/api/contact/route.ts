import { NextResponse } from "next/server";
import { parseContact } from "@/lib/backend/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const input = parseContact(await request.json() as Record<string, unknown>);
    if (!input) return NextResponse.json({ error: "Enter a valid name, phone number, and message." }, { status: 400 });
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("contact_submissions").insert(input);
    return error
      ? NextResponse.json({ error: "Your enquiry could not be submitted. Please use WhatsApp." }, { status: 503 })
      : NextResponse.json({ submitted: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Your enquiry could not be submitted. Please use WhatsApp." }, { status: 503 });
  }
}
