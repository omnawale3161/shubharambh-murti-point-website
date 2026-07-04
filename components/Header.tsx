import Image from "next/image";
import Link from "next/link";
import { HeaderNav } from "@/components/HeaderNav";
import { HeaderShopLinks } from "@/components/HeaderShopLinks";
import { MobileMenu } from "@/components/MobileMenu";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { whatsappUrl } from "@/lib/products";

export function Header() {
  return (
    <header className="glass-nav sticky top-0 z-50">
      <div className="premium-container flex min-h-[72px] items-center justify-between gap-6">
        <Link href="/" className="flex min-w-0 items-center gap-2 text-primary sm:gap-3">
          <Image src="/assets/logo.png" alt="Shubharambh Murti Point logo" width={44} height={44} quality={75} className="rounded-full border border-outline-variant bg-white" />
          <span className="truncate font-serif text-lg sm:text-2xl">Shubharambh Murti Point</span>
        </Link>
        <HeaderNav />
        <HeaderShopLinks />
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Open WhatsApp" className="hidden h-12 w-12 place-items-center rounded-full bg-whatsapp text-white shadow-card transition hover:-translate-y-0.5 xl:grid">
          <WhatsAppIcon size={25} />
        </a>
        <MobileMenu />
      </div>
    </header>
  );
}
