import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { HeaderNav, MobileHeaderNav } from "@/components/HeaderNav";
import { HeaderShopLinks, MobileShopLinks } from "@/components/HeaderShopLinks";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { whatsappUrl } from "@/lib/products";

export function Header() {
  return (
    <header className="glass-nav sticky top-0 z-50">
      <div className="premium-container flex min-h-[72px] items-center justify-between gap-6">
        <Link href="/" className="flex min-w-fit items-center gap-3 text-primary">
          <Image src="/assets/logo.png" alt="Shubharambh Murti Point logo" width={44} height={44} quality={75} className="rounded-full border border-outline-variant bg-white" />
          <span className="font-serif text-2xl">Shubharambh Murti Point</span>
        </Link>
        <HeaderNav />
        <HeaderShopLinks />
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Open WhatsApp" className="hidden h-12 w-12 place-items-center rounded-full bg-whatsapp text-white shadow-card transition hover:-translate-y-0.5 xl:grid">
          <WhatsAppIcon size={25} />
        </a>
        <details className="group relative md:hidden">
          <summary aria-label="Open navigation menu" className="grid h-11 w-11 list-none place-items-center rounded-full border border-outline-variant bg-white text-primary">
            <Menu size={20} />
          </summary>
          <nav aria-label="Mobile navigation" className="absolute right-0 top-14 grid w-56 max-w-[calc(100vw-36px)] gap-2 rounded-2xl border border-gold/20 bg-ivory p-3 text-sm font-bold text-ink shadow-premium">
            <MobileHeaderNav />
            <a href="https://instagram.com/shubharambh.murti" target="_blank" rel="noreferrer" className="rounded-xl px-3 py-2 hover:bg-beige">
              Instagram
            </a>
            <MobileShopLinks />
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Open WhatsApp" className="grid h-11 w-11 place-items-center rounded-full bg-whatsapp text-white">
              <WhatsAppIcon size={23} />
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}
