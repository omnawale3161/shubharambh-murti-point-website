import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { whatsappUrl } from "@/lib/products";

export function WhatsAppBubble() {
  return (
    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="fixed bottom-20 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-white shadow-hover transition hover:-translate-y-1 md:bottom-8 md:right-8">
      <WhatsAppIcon size={28} />
    </a>
  );
}
