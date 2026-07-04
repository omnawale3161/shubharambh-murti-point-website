import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { whatsappUrl } from "@/lib/products";

export function WhatsAppBubble() {
  return (
    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="fixed bottom-[calc(9.25rem+env(safe-area-inset-bottom))] left-3 z-30 grid h-11 w-11 place-items-center rounded-full bg-whatsapp text-white shadow-hover transition hover:-translate-y-1 md:bottom-8 md:left-auto md:right-8 md:z-40 md:h-14 md:w-14">
      <WhatsAppIcon size={24} className="md:h-7 md:w-7" />
    </a>
  );
}
