import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  createCustomer,
  getCustomerCredentialByEmail,
  hashPassword,
  parseRegistration
} from "@/lib/auth";
import { MissingSupabaseConfigurationError } from "@/lib/supabase/server";

export const runtime = "nodejs";

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
    if (error instanceof MissingSupabaseConfigurationError) {
      const message = process.env.NODE_ENV === "development"
        ? `Account registration needs Supabase setup. Add ${error.missingVariables.join(" and ")} to .env.local, then apply supabase/migrations/002_phase4_auth.sql.`
        : "Account registration is not configured. Please contact support.";
      return NextResponse.json({ error: message }, { status: 503 });
    }
    return NextResponse.json({ error: "Account registration is temporarily unavailable." }, { status: 503 });
  }
}
