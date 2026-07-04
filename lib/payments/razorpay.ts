import type { RazorpayOrder, RazorpayPayment } from "./types";

const razorpayApi = "https://api.razorpay.com/v1";

export class RazorpayApiError extends Error {
  constructor(public readonly status: number, message: string, public readonly responseBody?: string) {
    super(message);
    this.name = "RazorpayApiError";
  }
}

function authHeader(keyId: string, keySecret: string) {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

async function razorpayRequest<T>(
  path: string,
  credentials: { razorpayKeyId: string; razorpayKeySecret: string },
  init?: RequestInit
) {
  const response = await fetch(`${razorpayApi}${path}`, {
    ...init,
    headers: {
      Authorization: authHeader(credentials.razorpayKeyId, credentials.razorpayKeySecret),
      "Content-Type": "application/json",
      ...init?.headers
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new RazorpayApiError(
      response.status,
      `Razorpay request failed with status ${response.status}: ${responseBody}`,
      responseBody
    );
  }

  return response.json() as Promise<T>;
}

export function createRazorpayOrder({
  amountPaise,
  receipt,
  notes,
  ...credentials
}: {
  amountPaise: number;
  receipt: string;
  notes: Record<string, string>;
  razorpayKeyId: string;
  razorpayKeySecret: string;
}) {
  return razorpayRequest<RazorpayOrder>("/orders", credentials, {
    method: "POST",
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes
    })
  });
}

export function getRazorpayPayment(
  paymentId: string,
  credentials: { razorpayKeyId: string; razorpayKeySecret: string }
) {
  return razorpayRequest<RazorpayPayment>(`/payments/${encodeURIComponent(paymentId)}`, credentials);
}
