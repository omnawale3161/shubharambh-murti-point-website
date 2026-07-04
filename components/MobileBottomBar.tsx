"use client";

import Link from "next/link";
import { Grid2X2, Heart, Home, Search, ShoppingCart } from "lucide-react";
import { useShop } from "@/components/ShopProvider";

export function MobileBottomBar() {
  const { cartCount, isHydrated, wishlistCount } = useShop();
  const visibleCartCount = isHydrated ? cartCount : 0;
  const visibleWishlistCount = isHydrated ? wishlistCount : 0;

  return (
    <nav aria-label="Mobile quick actions" className="fixed inset-x-0 bottom-0 z-50 grid min-h-[68px] grid-cols-5 border-t border-outline-variant bg-white/95 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_32px_rgba(92,2,22,0.12)] backdrop-blur-md md:hidden">
      <Link href="/" className="grid min-h-11 place-items-center gap-0.5 rounded-2xl text-[10px] font-bold leading-none text-primary"><Home size={18} />Home</Link>
      <Link href="/collections" className="grid min-h-11 place-items-center gap-0.5 rounded-2xl text-[10px] font-bold leading-none text-primary"><Grid2X2 size={18} />Shop</Link>
      <Link href="/search" className="grid min-h-11 place-items-center gap-0.5 rounded-2xl text-[10px] font-bold leading-none text-primary"><Search size={18} />Search</Link>
      <Link href="/wishlist" className="relative grid min-h-11 place-items-center gap-0.5 rounded-2xl text-[10px] font-bold leading-none text-primary">
        <Heart size={19} />
        Wishlist
        {visibleWishlistCount ? <span className="absolute right-3 top-1 rounded-full bg-secondary-container px-1.5 text-[10px] leading-4 text-primary">{visibleWishlistCount}</span> : null}
      </Link>
      <Link href="/cart" className="relative grid min-h-11 place-items-center gap-0.5 rounded-2xl text-[10px] font-bold leading-none text-primary">
        <ShoppingCart size={19} />
        Cart
        {visibleCartCount ? <span className="absolute right-4 top-1 rounded-full bg-primary px-1.5 text-[10px] leading-4 text-white">{visibleCartCount}</span> : null}
      </Link>
    </nav>
  );
}
