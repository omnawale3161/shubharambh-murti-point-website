"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useShop } from "@/components/ShopProvider";
import { GlobalSearch } from "@/components/GlobalSearch";

export function HeaderShopLinks() {
  const { cartCount, isHydrated, wishlistCount } = useShop();
  const visibleCartCount = isHydrated ? cartCount : 0;
  const visibleWishlistCount = isHydrated ? wishlistCount : 0;

  return (
    <div className="hidden items-center gap-1 md:flex">
      <GlobalSearch />
      <Link href="/wishlist" aria-label={`Wishlist with ${visibleWishlistCount} items`} className="btn-icon btn-icon-circle relative">
        <Heart size={19} />
        {visibleWishlistCount > 0 ? <span className="absolute right-0 top-0 rounded-full bg-secondary-container px-1 text-[10px] font-bold text-primary">{visibleWishlistCount}</span> : null}
      </Link>
      <Link href="/cart" aria-label={`Cart with ${visibleCartCount} items`} className="btn-icon btn-icon-circle relative">
        <ShoppingCart size={19} />
        {visibleCartCount > 0 ? <span className="absolute right-0 top-0 rounded-full bg-secondary-container px-1 text-[10px] font-bold text-primary">{visibleCartCount}</span> : null}
      </Link>
    </div>
  );
}

export function MobileShopLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { cartCount, isHydrated, wishlistCount } = useShop();
  const visibleCartCount = isHydrated ? cartCount : 0;
  const visibleWishlistCount = isHydrated ? wishlistCount : 0;

  return (
    <>
      <GlobalSearch mobile />
      <Link href="/wishlist" onClick={onNavigate} className="rounded-xl px-3 py-3 hover:bg-beige">
        Wishlist {visibleWishlistCount > 0 ? `(${visibleWishlistCount})` : ""}
      </Link>
      <Link href="/cart" onClick={onNavigate} className="rounded-xl px-3 py-3 hover:bg-beige">
        Cart {visibleCartCount > 0 ? `(${visibleCartCount})` : ""}
      </Link>
    </>
  );
}
