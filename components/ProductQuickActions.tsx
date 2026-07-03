"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/lib/products";
import { useShop } from "@/components/ShopProvider";

export function ProductQuickActions({ product, outOfStock = false }: { product: Product; outOfStock?: boolean }) {
  const { addToCart, isWishlisted, toggleWishlist } = useShop();
  const wished = isWishlisted(product.id);

  return (
    <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 pb-3">
      {outOfStock ? (
        <button
          type="button"
          disabled
          className="btn btn-primary px-4 py-3 text-sm opacity-45"
        >
          Out of Stock
        </button>
      ) : (
        <Link
          href={`/checkout?productId=${product.id}&quantity=1&giftBox=false`}
          className="btn btn-primary px-4 py-3 text-sm"
        >
          Buy Now
        </Link>
      )}
      <button
        type="button"
        disabled={outOfStock}
        onClick={() => addToCart(product.id)}
        aria-label={outOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
        className="btn-icon disabled:cursor-not-allowed disabled:opacity-45"
      >
        <ShoppingCart size={19} />
      </button>
      <button
        type="button"
        aria-pressed={wished}
        aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        onClick={() => toggleWishlist(product.id)}
        className="btn-icon bg-primary text-lg font-bold text-white hover:bg-primary-container"
        title={wished ? "Remove from wishlist" : "Add to wishlist"}
      >
        {wished ? "♥" : "♡"}
      </button>
    </div>
  );
}
