"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Zap } from "lucide-react";
import {
  calculateProductTotal,
  formatPrice,
  GIFT_BOX_PRICE,
  orderMessage,
  Product
} from "@/lib/products";
import { useShop } from "@/components/ShopProvider";
import { PincodeChecker } from "@/components/pincode-checker";
import type { InventoryAvailability } from "@/lib/inventory";

export function ProductPurchasePanel({ product, inventory }: { product: Product; inventory?: InventoryAvailability | null }) {
  const [giftBox, setGiftBox] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { addToCart, isWishlisted, toggleWishlist } = useShop();
  const total = calculateProductTotal(product, giftBox) * quantity;
  const wished = isWishlisted(product.id);
  const outOfStock = inventory?.isOutOfStock ?? false;
  const maximumQuantity = inventory ? Math.min(10, Math.max(1, inventory.availableStock)) : 10;

  return (
    <div className="mt-8 grid gap-5">
      <div className="rounded-2xl border border-gold/20 bg-white/80 p-5">
        <label className="flex items-start gap-3 text-sm font-bold text-ink/75">
          <input
            name="gift-box"
            type="checkbox"
            checked={giftBox}
            onChange={(event) => setGiftBox(event.target.checked)}
            className="mt-1 h-5 w-5 accent-maroon"
          />
          <span>
            <span className="block text-base font-black text-ink">Gift box packing</span>
            Premium gift box and blessing card for {formatPrice(GIFT_BOX_PRICE)}.
          </span>
        </label>
      </div>

      <PincodeChecker />

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gold/20 bg-white/80 p-5">
        <div>
          <p className="text-sm font-black text-ink/60">Availability</p>
          <p className={`mt-1 font-black ${outOfStock ? "text-red-700" : inventory?.isLowStock ? "text-amber-700" : "text-green-700"}`}>{outOfStock ? "Out of stock" : inventory ? `${inventory.availableStock} remaining and ready to order` : "In stock and ready to order"}</p>
        </div>
        <div>
          <p className="mb-2 text-sm font-black text-ink/60">Quantity</p>
          <div className="flex items-center rounded-full border border-gold/30 bg-ivory p-1">
            <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid h-10 w-10 place-items-center rounded-full text-maroon transition hover:bg-white"><Minus size={16} /></button>
            <span className="min-w-10 text-center font-black" aria-live="polite">{quantity}</span>
            <button type="button" disabled={outOfStock || quantity >= maximumQuantity} aria-label="Increase quantity" onClick={() => setQuantity((value) => Math.min(maximumQuantity, value + 1))} className="grid h-10 w-10 place-items-center rounded-full text-maroon transition hover:bg-white disabled:opacity-40"><Plus size={16} /></button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-beige p-5">
        <p className="text-sm font-black text-ink/60">Estimated total</p>
        <p className="mt-1 text-3xl font-black text-maroon">{formatPrice(total)}</p>
        <p className="mt-2 text-sm font-semibold text-green-700">Shipping: FREE · Free Delivery Across India.</p>
      </div>

      <div className="sticky bottom-20 z-40 grid gap-3 rounded-3xl border border-gold/20 bg-white/95 p-3 shadow-premium backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
        <button
          type="button"
          disabled={outOfStock}
          onClick={() => router.push(`/checkout?productId=${encodeURIComponent(product.id)}&quantity=${quantity}&giftBox=${giftBox}`)}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Zap size={18} /> Buy Now
        </button>
        <button
          type="button"
          disabled={outOfStock}
          onClick={() => addToCart(product.id, giftBox, quantity)}
          className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-45"
        >
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            aria-pressed={wished}
            className="btn btn-secondary px-4 text-sm"
          >
            {wished ? "Wishlisted" : "Wishlist"}
          </button>
          <a href={orderMessage(product)} target="_blank" rel="noopener noreferrer" className="btn btn-secondary px-4 text-sm">
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
