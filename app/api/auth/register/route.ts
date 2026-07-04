import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  createCustomer,
  getCustomerCredentialByEmail,
  hashPassword,
  parseRegistration
} from "@/lib/auth";
import { MissingSupabaseConfigurationError, SupabaseServerRequestError } from "@/lib/supabase/server";

export const runtime = "nodejs";

function registrationErrorResponse(error: unknown) {
  if (error instanceof MissingSupabaseConfigurationError) {
    const message = process.env.NODE_ENV === "development"
      ? `Account registration needs Supabase setup. Add ${error.missingVariables.join(" and ")} to .env.local, then apply supabase/migrations/002_phase4_auth.sql.`
      : "Account registration is not configured. Please contact support.";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  if (error instanceof SupabaseServerRequestError) {
    if (error.status === 401 || error.status === 403) {
      const message = process.env.NODE_ENV === "development"
        ? "Account registration cannot access Supabase. Check SUPABASE_SERVICE_ROLE_KEY in .env.local and restart the dev server."
        : "Account registration is not configured. Please contact support.";
      return NextResponse.json({ error: message }, { status: 503 });
    }

    if (error.status === 404 || error.responseBody.toLowerCase().includes("customer_accounts")) {
      const message = process.env.NODE_ENV === "development"
        ? "Account registration needs the customer_accounts table. Apply supabase/migrations/002_phase4_auth.sql in Supabase, then restart the dev server."
        : "Account registration is not configured. Please contact support.";
      return NextResponse.json({ error: message }, { status: 503 });
    }

    if (error.status === 409) {
      return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });
    }

    const message = process.env.NODE_ENV === "development"
      ? `Supabase registration request failed with status ${error.status}. Check the customer_accounts table, service role key, and Supabase project status.`
      : "Account registration is temporarily unavailable.";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  if (error instanceof TypeError && error.message.toLowerCase().includes("fetch failed")) {
    const message = process.env.NODE_ENV === "development"
      ? "Account registration could not reach Supabase from this machine. Check your internet connection, firewall/proxy settings, SUPABASE_URL, and restart the dev server."
      : "Account registration is temporarily unavailable.";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  return NextResponse.json({ error: "Account registration is temporarily unavailable." }, { status: 503 });
}

export async function POST(request: Request) {
  try {
    const input = parseRegistration(await request.json());
    if (!input) {
      return NextResponse.json(
        { error: "Enter a valid name, email, phone number, and password of at least 8 characters." },
        { status: 400 }
      );
    }

    if (await getCustomerCredentialByEmail(input.email)) {
      return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });
    }

    const customer = await createCustomer({
      id: randomUUID(),
      name: input.name,
      email: input.email,
      phone: input.phone,
      password_hash: await hashPassword(input.password)
    });

    return NextResponse.json({ created: true, customerId: customer.id }, { status: 201 });
  } catch (error) {
    console.error("Customer registration failed", error);
    return registrationErrorResponse(error);
  }
}
