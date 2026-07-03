"use server";

import { formDataRecord, parseContact } from "@/lib/backend/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ContactActionState = { error?: string; success?: string };

export async function submitContactAction(_: ContactActionState, formData: FormData): Promise<ContactActionState> {
  const input = parseContact(formDataRecord(formData));
  if (!input) return { error: "Enter a valid name, phone number, and message of at least 10 characters." };
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("contact_submissions").insert(input);
    return error ? { error: "Your enquiry could not be submitted. Please use WhatsApp." } : { success: "Thank you. Your enquiry has been received." };
  } catch {
    return { error: "Online enquiries are not configured yet. Please continue on WhatsApp." };
  }
}

