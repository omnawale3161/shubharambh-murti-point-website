import { NextResponse } from "next/server";
import { indianPincodePattern, parseIndiaPostResponse } from "@/lib/delivery/pincode";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ pincode: string }> }) {
  const { pincode } = await params;
  if (!indianPincodePattern.test(pincode)) {
    return NextResponse.json({ error: "Enter a valid Indian 6-digit PIN code." }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Delivery service is temporarily unavailable." }, { status: 502 });
    }

    const result = parseIndiaPostResponse(await response.json());
    if (!result) {
      return NextResponse.json({ error: "No delivery details were found for this PIN code." }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Could not check delivery availability. Please try again." }, { status: 502 });
  }
}

