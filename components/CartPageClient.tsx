"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, whatsappUrl } from "@/lib/products";
import { useShop } from "@/components/ShopProvider";
import { calculateCartSubtotal } from "@/lib/shop";
import { PincodeChecker } from "@/components/pincode-checker";

export function CartPageClient() {
  const { cart, clearCart, isHydrated, removeFromCart, updateQuantity } = useShop();
  const subtotal = calculateCartSubtotal(cart);
  const cartMessage = `${whatsappUrl}?text=${encodeURIComponent(
    `Namaste, I want to order:\n${cart
      .map((item) => `- ${item.product.name} (${item.product.size}) x ${item.quantity}${item.options.giftBox ? " with gift box" : ""}`)
      .join("\n")}\nSubtotal: ${formatPrice(subtotal)}`
  )}`;

  if (!isHydrated) {
    return (
      <section className="premium-container py-16" aria-live="polite">
        <p className="section-kicker">Cart</p>
        <h1 className="mt-3 text-5xl font-black">Ready to Bring Home Divine Blessings</h1>
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <section className="premium-container py-16">
        <p className="section-kicker">Cart</p>
        <h1 className="mt-3 text-5xl font-black">Ready to Bring Home Divine Blessings</h1>
        <Link href="/collections" className="btn btn-primary mt-8">
          Browse Collection
        </Link>
      </section>
    );
  }

  return (
    <main className="premium-container py-14 md:py-20">
      <p className="section-kicker">Your Shopping Sanctuary</p>
      <h1 className="mt-3 text-5xl text-primary">Ready to Bring Home Divine Blessings</h1>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <section className="grid gap-4">
          {cart.map((item) => (
            <article key={`${item.productId}-${item.options.giftBox}`} className="grid gap-5 rounded-3xl bg-surface-container p-5 shadow-card sm:grid-cols-[150px_1fr]">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-container-low">
                <Image src={item.product.image} alt={item.product.name} fill sizes="140px" quality={68} className="object-contain" />
              </div>
              <div>
                <p className="section-kicker">{item.product.collection}</p>
                <h2 className="mt-2 text-3xl text-primary">{item.product.name}</h2>
                <p className="mt-2 text-sm text-on-surface-variant">{item.product.size} · {item.product.material}</p>
                {item.options.giftBox ? <p className="mt-2 text-sm font-black text-maroon">Gift box included</p> : null}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button type="button" aria-label={`Decrease quantity of ${item.product.name}`} onClick={() => updateQuantity(item.productId, item.quantity - 1, item.options.giftBox)} className="btn-icon btn-icon-circle text-xl font-black">-</button>
                  <span className="min-w-8 text-center font-black" aria-live="polite" aria-label={`Quantity ${item.quantity}`}>{item.quantity}</span>
                  <button type="button" aria-label={`Increase quantity of ${item.product.name}`} onClick={() => updateQuantity(item.productId, item.quantity + 1, item.options.giftBox)} className="btn-icon btn-icon-circle text-xl font-black">+</button>
                  <button type="button" aria-label={`Remove ${item.product.name} from cart`} onClick={() => removeFromCart(item.productId, item.options.giftBox)} className="btn btn-secondary min-h-10 px-4 py-2 text-sm">Remove</button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="h-fit rounded-3xl bg-surface-container p-5 shadow-card md:p-7 lg:sticky lg:top-28">
          <h2 className="text-3xl text-primary">Order Summary</h2>
          <p className="mt-7 text-sm font-bold text-on-surface-variant">Subtotal</p>
          <p className="mt-2 text-4xl font-semibold text-primary">{formatPrice(subtotal)}</p>
          <p className="mt-3 text-sm font-semibold leading-6 text-green-700">Shipping: FREE · Free Delivery Across India</p>
          <div className="mt-5 border-y border-gold/20 py-5">
            <PincodeChecker compact />
          </div>
          <section className="mt-5 rounded-2xl border border-gold/20 bg-white p-4">
            <label className="grid gap-2 text-sm font-bold text-on-surface-variant">
              Coupon Code
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input placeholder="Enter code" className="min-w-0 rounded-full border border-outline-variant px-4 py-3 outline-hidden focus:border-primary" />
                <button type="button" className="btn btn-secondary min-h-11 px-4 py-2 text-sm">
                  Apply
                </button>
              </div>
            </label>
          </section>
          <div className="sticky bottom-20 z-40 mt-6 grid gap-3 rounded-3xl bg-surface-container/95 p-2 backdrop-blur md:static md:p-0 md:backdrop-blur-none">
            <Link href="/checkout" className="btn btn-primary">Proceed to Checkout</Link>
            <a href={cartMessage} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Checkout on WhatsApp</a>
            <Link href="/collections" className="btn btn-secondary">Continue Shopping</Link>
            <button type="button" onClick={clearCart} className="btn btn-secondary border-error text-error hover:border-error hover:bg-error hover:text-white">Clear Cart</button>
          </div>
        </aside>
      </div>
    </main>
  );
}
