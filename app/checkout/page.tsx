import { Suspense } from "react";
import { CheckoutPageClient } from "@/components/CheckoutPageClient";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Checkout", "Complete your secure order.", "/checkout");

export default function CheckoutPage() {
  return <Suspense fallback={<main className="premium-container py-16"><h1 className="text-4xl">Loading checkout...</h1></main>}><CheckoutPageClient /></Suspense>;
}

