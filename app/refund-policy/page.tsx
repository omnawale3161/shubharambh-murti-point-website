import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Refund Policy",
  description: "Read the Shubharambh Murti Point refund, replacement, cancellation, and custom-order policy.",
  path: "/refund-policy"
});

export default function RefundPolicyPage() {
  return (
    <main className="premium-container max-w-3xl py-14">
      <p className="section-kicker">Refund Policy</p>
      <h1 className="mt-3 text-5xl font-black">Refund Policy</h1>
      <p className="mt-6 leading-8 text-ink/70">Refunds and replacements depend on product condition, customization, damage proof, and order status. Custom or specially sourced murtis may not be eligible for cancellation after confirmation.</p>
    </main>
  );
}
