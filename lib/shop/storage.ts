import {
  getProductById,
  getProductByLegacySlug,
  getProductBySlug,
  products
} from "@/lib/products";
import type { Product } from "@/lib/products";
import type { CartSelection, ShopState } from "./types";

export const SHOP_STORAGE_VERSION = 2;
export const cartStorageKey = "shubharambh-cart";
export const wishlistStorageKey = "shubharambh-wishlist";

type StorageEnvelope<T> = {
  version: typeof SHOP_STORAGE_VERSION;
  items: T[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveLegacyProduct(value: unknown): Product | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  if (typeof value.id === "string") {
    const product = getProductById(value.id);
    if (product) return product;
  }

  if (typeof value.slug === "string") {
    const product = getProductBySlug(value.slug) ?? getProductByLegacySlug(value.slug);
    if (product) return product;
  }

  if (typeof value.image === "string" && typeof value.size === "string") {
    const image = value.image;
    const size = value.size.trim();
    return products.find((product) => product.image === image && product.size.trim() === size);
  }

  return undefined;
}

function parseCartSelection(value: unknown): CartSelection | undefined {
  if (!isRecord(value) || typeof value.productId !== "string" || !getProductById(value.productId)) {
    return undefined;
  }

  const quantity = typeof value.quantity === "number" ? Math.floor(value.quantity) : 0;
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 99) {
    return undefined;
  }

  const options = isRecord(value.options) ? value.options : {};

  return {
    productId: value.productId,
    quantity,
    options: { giftBox: options.giftBox === true }
  };
}

function parseWishlistProductId(value: unknown) {
  return typeof value === "string" && getProductById(value) ? value : undefined;
}

function readEnvelope<T>(raw: string | null, parseItem: (value: unknown) => T | undefined): T[] | undefined {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== SHOP_STORAGE_VERSION || !Array.isArray(parsed.items)) {
      return undefined;
    }

    return parsed.items.map(parseItem).filter((item): item is T => item !== undefined);
  } catch {
    return [];
  }
}

function migrateLegacyCart(raw: string | null): CartSelection[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((value) => {
      if (!isRecord(value)) return [];

      const product = resolveLegacyProduct(value.product);
      const quantity = typeof value.quantity === "number" ? Math.min(99, Math.max(1, Math.floor(value.quantity))) : 1;

      return product
        ? [{ productId: product.id, quantity, options: { giftBox: value.giftBox === true } }]
        : [];
    });
  } catch {
    return [];
  }
}

function migrateLegacyWishlist(raw: string | null): string[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((value) => {
      const product = resolveLegacyProduct(value);
      return product ? [product.id] : [];
    });
  } catch {
    return [];
  }
}

function deduplicateCart(items: CartSelection[]) {
  return items.reduce<CartSelection[]>((result, item) => {
    const existing = result.find(
      (entry) => entry.productId === item.productId && entry.options.giftBox === item.options.giftBox
    );

    if (existing) {
      existing.quantity = Math.min(99, existing.quantity + item.quantity);
      return result;
    }

    return [...result, { ...item, options: { ...item.options } }];
  }, []);
}

function uniqueProductIds(ids: string[]) {
  return [...new Set(ids)];
}

export function readShopState(storage: Storage): ShopState {
  try {
    const rawCart = storage.getItem(cartStorageKey);
    const rawWishlist = storage.getItem(wishlistStorageKey);

    const versionedCart = readEnvelope(rawCart, parseCartSelection);
    const versionedWishlist = readEnvelope(rawWishlist, parseWishlistProductId);

    return {
      cart: deduplicateCart(versionedCart ?? migrateLegacyCart(rawCart)),
      wishlistProductIds: uniqueProductIds(versionedWishlist ?? migrateLegacyWishlist(rawWishlist))
    };
  } catch {
    return { cart: [], wishlistProductIds: [] };
  }
}

export function writeCart(storage: Storage, cart: CartSelection[]) {
  try {
    const envelope: StorageEnvelope<CartSelection> = { version: SHOP_STORAGE_VERSION, items: cart };
    storage.setItem(cartStorageKey, JSON.stringify(envelope));
  } catch {
    // Storage can be unavailable in private browsing or under quota pressure.
  }
}

export function writeWishlist(storage: Storage, wishlistProductIds: string[]) {
  try {
    const envelope: StorageEnvelope<string> = { version: SHOP_STORAGE_VERSION, items: wishlistProductIds };
    storage.setItem(wishlistStorageKey, JSON.stringify(envelope));
  } catch {
    // Keep the in-memory shopping experience working when persistence is unavailable.
  }
}
