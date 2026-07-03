import { instagramUrl, whatsappUrl } from "@/lib/products";
import { createPageMetadata } from "@/lib/seo";
import { ContactForm } from "@/components/ContactForm";

export const metadata = createPageMetadata({
  title: "Contact",
  description: "Contact Shubharambh Murti Point for current murti photos, product enquiries, delivery guidance, and WhatsApp ordering.",
  path: "/contact"
});

export default function ContactPage() {
  return (
    <main className="premium-container py-14">
      <p className="section-kicker">Contact Page</p>
      <h1 className="mt-3 max-w-3xl text-5xl font-black leading-tight">Order, enquire, or ask for current collection photos.</h1>
      <section className="mt-10 grid gap-8 md:grid-cols-[1fr_0.9fr]">
        <ContactForm />
        <aside className="rounded-3xl bg-beige p-8">
          <h2 className="text-3xl font-black">Shubharambh Murti Point</h2>
          <div className="mt-6 grid gap-4 text-ink/72">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp: +91 7796675304</a>
            <a href={instagramUrl}>Instagram: @shubharambh.murti</a>
            <p>Website: shubharambhmurti.com</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
