"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProductById, Product } from "@/lib/products";
import {
  CartItem,
  CartSelection,
  readShopState,
  writeCart,
  writeWishlist
} from "@/lib/shop";

type ShopContextValue = {
  cart: CartItem[];
  wishlist: Product[];
  cartCount: number;
  wishlistCount: number;
  isHydrated: boolean;
  getProductById: (productId: string) => Product | undefined;
  addToCart: (productId: string, giftBox?: boolean, quantity?: number) => void;
  removeFromCart: (productId: string, giftBox?: boolean) => void;
  updateQuantity: (productId: string, quantity: number, giftBox?: boolean) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children, initialProducts = [] }: { children: React.ReactNode; initialProducts?: readonly Product[] }) {
  const [cartSelections, setCartSelections] = useState<CartSelection[]>([]);
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const productById = useMemo(
    () => new Map(initialProducts.map((product) => [product.id, product])),
    [initialProducts]
  );
  const resolveProductById = useMemo(
    () => (productId: string) => productById.get(productId) ?? getProductById(productId),
    [productById]
  );

  /* eslint-disable react-hooks/set-state-in-effect -- Browser storage must load after hydration to preserve SSR output. */
  useEffect(() => {
    const state = readShopState(window.localStorage);
    setCartSelections(state.cart);
    setWishlistProductIds(state.wishlistProductIds);
    setIsHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (isHydrated) {
      writeCart(window.localStorage, cartSelections);
    }
  }, [cartSelections, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      writeWishlist(window.localStorage, wishlistProductIds);
    }
  }, [isHydrated, wishlistProductIds]);

  const cart = useMemo<CartItem[]>(
    () =>
      cartSelections.flatMap((selection) => {
        const product = resolveProductById(selection.productId);
        return product ? [{ ...selection, product }] : [];
      }),
    [cartSelections, resolveProductById]
  );

  const wishlist = useMemo<Product[]>(
    () => wishlistProductIds.flatMap((productId) => {
      const product = resolveProductById(productId);
      return product ? [product] : [];
    }),
    [resolveProductById, wishlistProductIds]
  );

  const value = useMemo<ShopContextValue>(() => {
    function addToCart(productId: string, giftBox = false, quantity = 1) {
      if (!resolveProductById(productId)) return;
      const safeQuantity = Math.min(99, Math.max(1, Math.floor(quantity)));

      setCartSelections((items) => {
        const existing = items.find(
          (item) => item.productId === productId && item.options.giftBox === giftBox
        );

        if (existing) {
          return items.map((item) =>
            item.productId === productId && item.options.giftBox === giftBox
              ? { ...item, quantity: Math.min(99, item.quantity + safeQuantity) }
              : item
          );
        }

        return [...items, { productId, quantity: safeQuantity, options: { giftBox } }];
      });
    }

    function removeFromCart(productId: string, giftBox = false) {
      setCartSelections((items) =>
        items.filter((item) => item.productId !== productId || item.options.giftBox !== giftBox)
      );
    }

    function updateQuantity(productId: string, quantity: number, giftBox = false) {
      setCartSelections((items) =>
        items.flatMap((item) => {
          if (item.productId !== productId || item.options.giftBox !== giftBox) {
            return [item];
          }

          return quantity > 0 ? [{ ...item, quantity: Math.min(99, Math.floor(quantity)) }] : [];
        })
      );
    }

    function toggleWishlist(productId: string) {
      if (!resolveProductById(productId)) return;

      setWishlistProductIds((items) =>
        items.includes(productId)
          ? items.filter((item) => item !== productId)
          : [...items, productId]
      );
    }

    return {
      cart,
      wishlist,
      cartCount: cart.reduce((total, item) => total + item.quantity, 0),
      wishlistCount: wishlist.length,
      isHydrated,
      getProductById: resolveProductById,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart: () => setCartSelections([]),
      toggleWishlist,
      isWishlisted: (productId: string) => wishlistProductIds.includes(productId)
    };
  }, [cart, isHydrated, resolveProductById, wishlist, wishlistProductIds]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error("useShop must be used inside ShopProvider");
  }

  return context;
}
