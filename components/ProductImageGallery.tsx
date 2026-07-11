"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

export function ProductImageGallery({ images, productName }: { images: readonly string[]; productName: string }) {
  const gallery = useMemo(() => {
    const unique = new Set<string>();
    images.forEach((image) => {
      const clean = image.trim();
      if (clean) unique.add(clean);
    });
    return [...unique];
  }, [images]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = gallery[selectedIndex] || "/assets/logo.png";
  const hasMultipleImages = gallery.length > 1;
  const isFirst = selectedIndex === 0;
  const isLast = selectedIndex === gallery.length - 1;

  return (
    <div>
      <div className="product-image-frame relative h-[420px] rounded-3xl border border-outline-variant bg-white shadow-card sm:h-[500px] md:h-[680px]">
        <Image
          src={selected}
          alt={productName}
          fill
          priority
          fetchPriority="high"
          quality={78}
          sizes="(max-width:768px) 100vw, 50vw"
          className="object-contain p-3"
        />
        {hasMultipleImages ? (
          <>
            <button
              type="button"
              onClick={() => setSelectedIndex((index) => Math.max(0, index - 1))}
              disabled={isFirst}
              aria-label="Show previous product image"
              className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-outline-variant bg-white/95 text-primary shadow-card transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-outline-variant disabled:hover:text-primary sm:left-5 sm:size-12"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={() => setSelectedIndex((index) => Math.min(gallery.length - 1, index + 1))}
              disabled={isLast}
              aria-label="Show next product image"
              className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-outline-variant bg-white/95 text-primary shadow-card transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-outline-variant disabled:hover:text-primary sm:right-5 sm:size-12"
            >
              <ChevronRight size={24} />
            </button>
            <span className="absolute bottom-4 right-4 rounded-full border border-outline-variant bg-white/95 px-3 py-1 text-xs font-black text-primary shadow-card">
              {selectedIndex + 1} / {gallery.length}
            </span>
          </>
        ) : null}
      </div>
      {hasMultipleImages ? (
        <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2" aria-label="Product gallery">
          {gallery.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`Show ${productName} image ${index + 1}`}
              aria-pressed={selectedIndex === index}
              className="relative h-20 w-20 shrink-0 snap-start overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-card transition hover:border-gold aria-pressed:border-primary aria-pressed:ring-2 aria-pressed:ring-primary/20 md:h-24 md:w-24"
            >
              <Image
                src={image}
                alt={`${productName} gallery image ${index + 1}`}
                fill
                sizes="96px"
                quality={65}
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
