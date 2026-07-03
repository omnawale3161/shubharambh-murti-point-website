import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description: "Read how Shubharambh Murti Point handles customer, order, delivery, and payment information.",
  path: "/privacy-policy"
});

export default function PrivacyPolicyPage() {
  return (
    <main className="premium-container max-w-3xl py-14">
      <p className="section-kicker">Privacy Policy</p>
      <h1 className="mt-3 text-5xl font-black">Privacy Policy</h1>
      <p className="mt-6 leading-8 text-ink/70">We collect customer details such as name, phone number, address, and order information only to process enquiries, orders, delivery, and customer support. Payment details are handled by secure payment partners such as Razorpay.</p>
    </main>
  );
}
