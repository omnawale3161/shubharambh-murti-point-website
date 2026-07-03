import { describe, expect, it } from "vitest";
import { products } from "@/lib/products";
import {
  cartStorageKey,
  readShopState,
  SHOP_STORAGE_VERSION,
  wishlistStorageKey,
  writeCart,
  writeWishlist
} from "@/lib/shop";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("shop storage", () => {
  it("round-trips normalized cart and wishlist state", () => {
    const storage = new MemoryStorage();
    const cart = [{ productId: products[0].id, quantity: 2, options: { giftBox: true } }];

    writeCart(storage, cart);
    writeWishlist(storage, [products[0].id]);

    expect(readShopState(storage)).toEqual({
      cart,
      wishlistProductIds: [products[0].id]
    });
  });

  it("migrates legacy product snapshots and caps quantities", () => {
    const storage = new MemoryStorage();
    storage.setItem(cartStorageKey, JSON.stringify([
      { product: products[0], quantity: 120, giftBox: true }
    ]));
    storage.setItem(wishlistStorageKey, JSON.stringify([products[0], products[0]]));

    expect(readShopState(storage)).toEqual({
      cart: [{ productId: products[0].id, quantity: 99, options: { giftBox: true } }],
      wishlistProductIds: [products[0].id]
    });
  });

  it("discards invalid versioned records", () => {
    const storage = new MemoryStorage();
    storage.setItem(cartStorageKey, JSON.stringify({
      version: SHOP_STORAGE_VERSION,
      items: [
        { productId: "unknown", quantity: 1, options: {} },
        { productId: products[0].id, quantity: 0, options: {} }
      ]
    }));

    expect(readShopState(storage).cart).toEqual([]);
  });
});
