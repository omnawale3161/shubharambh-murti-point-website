"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useShop } from "@/components/ShopProvider";
import { Product, ProductCollection } from "@/lib/products";
import type { InventoryAvailability } from "@/lib/inventory";

export function CollectionBrowser({
  collections,
  products,
  selectedCollection,
  inventory,
}: {
  collections: readonly ProductCollection[];
  products: readonly Product[];
  selectedCollection?: string;
  inventory: Record<string, InventoryAvailability>;
}) {
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState(selectedCollection || "");
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const { isWishlisted } = useShop();

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCollection = collection ? product.collection === collection : true;
      const matchesWishlist = wishlistOnly ? isWishlisted(product.id) : true;
      const searchable = `${product.name} ${product.collection} ${product.size} ${product.material}`.toLowerCase();
      const matchesQuery = normalizedQuery ? searchable.includes(normalizedQuery) : true;

      return matchesCollection && matchesWishlist && matchesQuery;
    });
  }, [collection, isWishlisted, products, query, wishlistOnly]);

  return (
    <>
      <section className="grid gap-4 rounded-3xl border border-outline-variant bg-white p-4 shadow-card md:grid-cols-[1fr_240px_auto] md:p-5">
        <label className="grid gap-2 text-sm font-bold text-on-surface-variant">
          Search products
          <input
            type="search"
            aria-controls="product-results"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Ganpati, Shivaji, Hanuman..."
            className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-5 py-3 text-base outline-hidden transition focus:border-gold"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-on-surface-variant">
          Collection
          <select
            value={collection}
            onChange={(event) => setCollection(event.target.value)}
            className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-5 py-3 text-base outline-hidden transition focus:border-gold"
          >
            <option value="">All collections</option>
            {collections.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="flex items-end gap-3 px-2 py-3 text-sm font-bold text-primary">
          <input
            type="checkbox"
            checked={wishlistOnly}
            onChange={(event) => setWishlistOnly(event.target.checked)}
            className="h-5 w-5 accent-maroon"
          />
          Wishlist only
        </label>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" aria-pressed={!collection} onClick={() => setCollection("")} className="rounded-full border border-gold bg-white px-5 py-2 text-xs font-bold uppercase tracking-widest text-primary aria-pressed:bg-primary aria-pressed:text-white">
          All
        </button>
        {collections.map((item) => (
          <button key={item} type="button" aria-pressed={collection === item} onClick={() => setCollection(item)} className="rounded-full border border-gold bg-white px-5 py-2 text-xs font-bold uppercase tracking-widest text-primary aria-pressed:bg-primary aria-pressed:text-white">
            {item}
          </button>
        ))}
      </div>

      <p className="mt-8 text-sm font-bold text-ink/62" aria-live="polite" aria-atomic="true">{visibleProducts.length} products found</p>
      <div id="product-results" className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
        {visibleProducts.map((product) => <ProductCard key={product.slug} product={product} inventory={inventory[product.slug]} />)}
      </div>
      {visibleProducts.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-beige p-8 text-center">
          <p className="font-black">No products match these filters.</p>
          <button type="button" onClick={() => { setQuery(""); setCollection(""); setWishlistOnly(false); }} className="btn btn-primary mt-4 text-sm">
            Clear filters
          </button>
        </div>
      ) : null}
    </>
  );
}
