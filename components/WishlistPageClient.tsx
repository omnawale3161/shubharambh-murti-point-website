"use client";

import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { useShop } from "@/components/ShopProvider";

export function WishlistPageClient() {
  const { isHydrated, wishlist } = useShop();

  if (!isHydrated) {
    return (
      <section className="premium-container py-16" aria-live="polite">
        <p className="section-kicker">Wishlist</p>
        <h1 className="mt-3 text-5xl font-black">Loading your wishlist...</h1>
      </section>
    );
  }

  if (wishlist.length === 0) {
    return (
      <section className="premium-container py-16">
        <p className="section-kicker">Wishlist</p>
        <h1 className="mt-3 text-5xl font-black">Gather Your Favorite Blessings Here!</h1>
        <Link href="/collections" className="btn btn-primary mt-8">
          Explore Collection
        </Link>
      </section>
    );
  }

  return (
    <main className="premium-container py-14">
      <p className="section-kicker">Wishlist</p>
      <h1 className="mt-3 text-5xl font-black">Gather Your Favorite Blessings Here!</h1>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {wishlist.map((product) => <ProductCard key={product.slug} product={product} />)}
      </div>
    </main>
  );
}
