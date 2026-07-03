"use client";

import Image from "next/image";
import Link from "next/link";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/products";

type SearchResult = {
  id: string;
  slug: string;
  name: string;
  collection: string;
  size: string;
  image: string;
  price: number;
};

export function GlobalSearchDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== "Tab" || !dialogRef.current) return;
    const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )];
    const first = focusable[0];
    const last = focusable.at(-1);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal
        });
        setResults(response.ok ? await response.json() as SearchResult[] : []);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, query ? 180 : 0);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="fixed inset-0 z-100 bg-ink/45 p-3 backdrop-blur-xs sm:p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} onKeyDown={handleDialogKeyDown} className="mx-auto mt-[4vh] max-h-[92vh] max-w-2xl overflow-hidden rounded-2xl border border-gold/25 bg-ivory shadow-premium sm:mt-[8vh] sm:max-h-[84vh]" role="dialog" aria-modal="true" aria-labelledby="product-search-title">
        <div className="flex items-center gap-3 border-b border-gold/20 p-4">
          <h2 id="product-search-title" className="sr-only">Search products</h2>
          <input
            autoFocus
            aria-label="Search products"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Ganpati, Shivaji, Hanuman..."
            className="min-h-12 flex-1 rounded-full border border-gold/30 bg-white px-5 font-semibold outline-hidden focus:border-maroon"
          />
          <button type="button" onClick={onClose} className="h-12 w-12 rounded-full border border-maroon/20 bg-white text-xl font-black text-maroon" aria-label="Close search">×</button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto p-4">
          <p className="mb-3 text-sm font-black text-ink/60" aria-live="polite" aria-atomic="true">
            {isLoading ? "Searching..." : query ? `${results.length} matching products` : "Popular products"}
          </p>
          <div className="grid gap-2">
            {results.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`} onClick={onClose} className="grid grid-cols-[64px_1fr] items-center gap-3 rounded-xl border border-gold/15 bg-white p-2 transition hover:border-gold/50 sm:grid-cols-[72px_1fr_auto]">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-beige">
                  <Image src={product.image} alt="" fill sizes="72px" quality={65} className="object-contain" />
                </div>
                <div>
                  <p className="font-black text-ink">{product.name}</p>
                  <p className="mt-1 text-xs font-bold text-ink/55">{product.collection} · {product.size}</p>
                </div>
                <p className="text-sm font-black text-maroon sm:text-right">{formatPrice(product.price)}</p>
              </Link>
            ))}
            {!isLoading && results.length === 0 ? (
              <div className="rounded-xl bg-beige p-6 text-center">
                <p className="font-black text-ink">No matching murtis found.</p>
                <Link href="/collections" onClick={onClose} className="mt-3 inline-flex font-black text-maroon">Browse all collections</Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
