"use client";

import Link from "next/link";
import { Search, ShoppingCart } from "lucide-react";
import { useShop } from "@/components/ShopProvider";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { whatsappUrl } from "@/lib/products";

export function MobileBottomBar() {
  const { cartCount, isHydrated } = useShop();

  return (
    <nav aria-label="Mobile quick actions" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 border-t border-outline-variant bg-surface/95 px-3 py-2 backdrop-blur-md md:hidden">
      <Link href="/search" className="grid place-items-center gap-1 text-xs font-bold text-primary"><Search size={19} />Search</Link>
      <Link href="/cart" className="relative grid place-items-center gap-1 text-xs font-bold text-primary"><ShoppingCart size={19} />Cart{isHydrated && cartCount ? <span className="absolute right-[27%] top-0 rounded-full bg-primary px-1.5 text-[10px] text-white">{cartCount}</span> : null}</Link>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Open WhatsApp" className="grid place-items-center gap-1 text-xs font-bold text-tertiary"><WhatsAppIcon size={20} /></a>
    </nav>
  );
}
