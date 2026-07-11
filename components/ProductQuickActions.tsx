"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { Product } from "@/lib/products";
import { useShop } from "@/components/ShopProvider";

export function ProductQuickActions({
  product,
  outOfStock = false,
  showSecondaryActions = true
}: {
  product: Product;
  outOfStock?: boolean;
  showSecondaryActions?: boolean;
}) {
  const { addToCart, cart, isWishlisted, toggleWishlist } = useShop();
  const wished = isWishlisted(product.id);
  const addedToCart = cart.some((item) => item.productId === product.id);

  return (
    <div className={showSecondaryActions ? "mt-auto grid grid-cols-[minmax(0,1fr)_auto_auto] items-stretch gap-2 px-2 pb-2 sm:px-3 sm:pb-3" : "mt-auto grid items-stretch gap-2 px-2 pb-2 sm:px-3 sm:pb-3"}>
      {outOfStock ? (
        <button type="button" disabled className="btn btn-primary h-11 min-h-11 w-full whitespace-nowrap px-3 py-2 text-xs opacity-45 sm:h-12 sm:min-h-12 sm:px-4 sm:py-3 sm:text-sm">
          Out of Stock
        </button>
      ) : (
        <Link href={`/checkout?productId=${product.id}&quantity=1&giftBox=false`} className="btn btn-primary h-11 min-h-11 w-full whitespace-nowrap px-3 py-2 text-xs sm:h-12 sm:min-h-12 sm:px-4 sm:py-3 sm:text-sm">
          Buy Now
        </Link>
      )}
      {showSecondaryActions ? (
        <>
          <button
            type="button"
            disabled={outOfStock}
            onClick={() => addToCart(product.id)}
            aria-pressed={addedToCart}
            aria-label={outOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
            className="btn-icon h-11 min-h-11 w-11 min-w-11 bg-primary text-white hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-45 sm:h-12 sm:min-h-12 sm:w-12 sm:min-w-12"
          >
            <ShoppingCart size={19} fill={addedToCart ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            aria-pressed={wished}
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            onClick={() => toggleWishlist(product.id)}
            className="btn-icon h-11 min-h-11 w-11 min-w-11 bg-primary text-white hover:bg-primary-container sm:h-12 sm:min-h-12 sm:w-12 sm:min-w-12"
            title={wished ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={19} fill={wished ? "currentColor" : "none"} />
          </button>
        </>
      ) : null}
    </div>
  );
}
