import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Shipping Policy",
  description: "Read about free delivery across India, murti packing, pickup, courier delivery timelines, and dispatch support.",
  path: "/shipping-policy"
});

export default function ShippingPolicyPage() {
  return (
    <main className="premium-container max-w-3xl py-14">
      <p className="section-kicker">Shipping Policy</p>
      <h1 className="mt-3 text-5xl font-black">Shipping Policy</h1>
      <p className="mt-6 leading-8 text-ink/70">We offer free delivery across India on every order. Delivery time depends on product size, packing needs, customer location, and courier availability. Fragile products are packed carefully, and pickup remains available for selected pieces.</p>
    </main>
  );
}
