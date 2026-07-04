import Image from "next/image";
import Link from "next/link";
import { Eye, Star } from "lucide-react";
import { ProductQuickActions } from "@/components/ProductQuickActions";
import { formatPrice, Product, productRating } from "@/lib/products";
import type { InventoryAvailability } from "@/lib/inventory";

export function ProductCard({
  product,
  inventory,
  showSecondaryActions = true
}: {
  product: Product;
  inventory?: InventoryAvailability;
  showSecondaryActions?: boolean;
}) {
  const rating = productRating(product);

  return (
    <article className="premium-card group flex h-full flex-col overflow-hidden rounded-2xl p-1.5 sm:rounded-3xl sm:p-2">
      <div className="relative">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-white sm:rounded-2xl">
            <Image
              src={product.image}
              alt={product.name}
              fill
              quality={72}
              className="object-contain p-2 transition duration-700 group-hover:scale-105 sm:p-3"
              sizes="(max-width: 480px) 50vw, (max-width: 1024px) 33vw, (max-width: 1439px) 25vw, 20vw"
            />
            <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-white sm:left-3 sm:top-3 sm:px-3 sm:text-[10px]">
              {product.badge}
            </span>
            {inventory?.isOutOfStock ? (
              <span className="absolute right-2 top-2 rounded-full bg-red-700 px-2 py-1 text-[9px] font-bold uppercase text-white sm:right-3 sm:top-3 sm:px-3 sm:text-[10px]">
                Out of Stock
              </span>
            ) : inventory?.isLowStock ? (
              <span className="absolute right-2 top-2 rounded-full bg-amber-600 px-2 py-1 text-[9px] font-bold uppercase text-white sm:right-3 sm:top-3 sm:px-3 sm:text-[10px]">
                Only {inventory.availableStock} left
              </span>
            ) : null}
          </div>
        </Link>
        <Link
          href={`/products/${product.slug}`}
          aria-label={`Quick view ${product.name}`}
          className="absolute bottom-2 left-2 hidden h-9 w-9 place-items-center rounded-full bg-white text-primary shadow-card transition hover:-translate-y-0.5 sm:grid"
        >
          <Eye size={18} />
        </Link>
      </div>
      <Link href={`/products/${product.slug}`} className="block flex-1">
        <div className="flex h-full flex-col px-2 pb-3 pt-4 sm:px-3 sm:pt-5">
          <p className="section-kicker">{product.collection}</p>
          <h3 className="mt-2 line-clamp-2 min-h-[3.25rem] text-lg leading-tight text-on-surface sm:text-2xl">{product.name}</h3>
          <p className="mt-2 line-clamp-1 text-xs text-on-surface-variant sm:text-sm">{product.size} · {product.material}</p>
          <p className="mt-auto pt-4 text-lg font-semibold text-primary sm:text-xl">{formatPrice(product.price)}</p>
          {rating.count > 0 ? (
            <p className="mt-2 flex items-center gap-1 text-sm font-black text-gold" aria-label={`${rating.rating} star rating from ${rating.count} reviews`}>
              <Star size={15} fill="currentColor" />
              <span>{rating.rating}</span>
              <span className="hidden text-on-surface-variant sm:inline">({rating.count} reviews)</span>
            </p>
          ) : null}
        </div>
      </Link>
      <ProductQuickActions product={product} outOfStock={inventory?.isOutOfStock} showSecondaryActions={showSecondaryActions} />
    </article>
  );
}
