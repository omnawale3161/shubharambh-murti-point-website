import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { formatPrice, orderMessage, Product, productRating } from "@/lib/products";
import { ProductQuickActions } from "@/components/ProductQuickActions";
import type { InventoryAvailability } from "@/lib/inventory";

export function ProductCard({ product, inventory }: { product: Product; inventory?: InventoryAvailability }) {
  const rating = productRating(product);

  return (
    <article className="premium-card group overflow-hidden rounded-3xl p-2">
      <div className="relative">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-container-low">
            <Image src={product.image} alt={product.name} fill quality={72} className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 767px) calc(100vw - 56px), (max-width: 1180px) 33vw, 390px" />
            <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">{product.badge}</span>
            {inventory?.isOutOfStock ? <span className="absolute right-3 top-3 rounded-full bg-red-700 px-3 py-1 text-[10px] font-bold uppercase text-white">Out of Stock</span> : inventory?.isLowStock ? <span className="absolute right-3 top-3 rounded-full bg-amber-600 px-3 py-1 text-[10px] font-bold uppercase text-white">Only {inventory.availableStock} left</span> : null}
          </div>
        </Link>
        <a href={orderMessage(product)} target="_blank" rel="noopener noreferrer" aria-label={`Order ${product.name} on WhatsApp`} className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-whatsapp text-white shadow-card">
          <WhatsAppIcon size={20} />
        </a>
      </div>
      <Link href={`/products/${product.slug}`} className="block">
        <div className="px-3 pb-3 pt-5">
          <p className="section-kicker">{product.collection}</p>
          <h3 className="mt-2 text-2xl text-on-surface">{product.name}</h3>
          <p className="mt-2 text-sm text-on-surface-variant">{product.size} · {product.material}</p>
          <p className="mt-4 text-xl font-semibold text-primary">{formatPrice(product.price)}</p>
          <p className="mt-2 flex items-center gap-1 text-sm font-black text-gold" aria-label={`${rating.rating} star rating from ${rating.count} reviews`}>
            <Star size={15} fill="currentColor" />
            <span>{rating.rating}</span>
            <span className="text-on-surface-variant">({rating.count} reviews)</span>
          </p>
        </div>
      </Link>
      <ProductQuickActions product={product} outOfStock={inventory?.isOutOfStock} />
    </article>
  );
}
