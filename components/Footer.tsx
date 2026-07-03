import Link from "next/link";
import { instagramUrl, whatsappUrl } from "@/lib/products";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-outline-variant bg-surface-container-low pb-20 text-on-surface md:pb-0">
      <div className="premium-container grid gap-10 py-16 md:grid-cols-4">
        <div>
          <h2 className="font-serif text-3xl text-primary">Shubharambh</h2>
          <p className="mt-4 max-w-xs text-sm leading-7 text-on-surface-variant">Crafting digital sanctuaries for the modern devotee. Premium handcrafted murti and artifacts delivered to your doorstep.</p>
        </div>
        <div className="grid content-start gap-3 text-sm text-on-surface-variant">
          <p className="mb-2 font-bold text-on-surface">Quick Links</p>
          <Link href="/collections">Collections</Link>
          <Link href="/about">About Us</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div className="grid content-start gap-3 text-sm text-on-surface-variant">
          <p className="mb-2 font-bold text-on-surface">Support</p>
          <Link href="/login">Customer Login</Link>
          <Link href="/account">My Account</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/refund-policy">Refund Policy</Link>
          <Link href="/shipping-policy">Shipping Policy</Link>
        </div>
        <div className="grid content-start gap-3 text-sm text-on-surface-variant">
          <p className="mb-2 font-bold text-on-surface">Connect</p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp: +91 7796675304</a>
          <a href={instagramUrl}>Instagram: @shubharambh.murti</a>
          <p>shubharambhmurti.com</p>
        </div>
      </div>
      <div className="border-t border-outline-variant py-5 text-center text-xs text-on-surface-variant">© 2026 Shubharambh Murti Point. All rights reserved.</div>
    </footer>
  );
}
