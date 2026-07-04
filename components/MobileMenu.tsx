"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { MobileHeaderNav } from "@/components/HeaderNav";
import { MobileShopLinks } from "@/components/HeaderShopLinks";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { whatsappUrl } from "@/lib/products";

export function MobileMenu() {
  const pathname = usePathname();

  return <MobileMenuContent key={pathname} />;
}

function MobileMenuContent() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onPointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <div className="relative md:hidden" ref={menuRef}>
        <button
          type="button"
          data-testid="mobile-menu-button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="grid h-11 w-11 list-none place-items-center rounded-full border border-outline-variant bg-white text-primary transition hover:border-gold"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav
          aria-label="Mobile navigation"
          onClickCapture={(event) => {
            const target = event.target as HTMLElement;
            if (target.closest("a")) setOpen(false);
          }}
          className={`absolute right-0 top-14 z-50 grid w-72 max-w-[calc(100vw-24px)] origin-top-right gap-2 rounded-3xl border border-gold/20 bg-ivory p-3 text-sm font-bold text-ink shadow-premium transition duration-200 ${open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`}
        >
          <MobileHeaderNav onNavigate={() => setOpen(false)} />
          <a href="https://instagram.com/shubharambh.murti" target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 hover:bg-beige">
            Instagram
          </a>
          <MobileShopLinks onNavigate={() => setOpen(false)} />
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} aria-label="Open WhatsApp" className="grid min-h-11 place-items-center rounded-xl bg-whatsapp px-3 py-2 text-white">
            <WhatsAppIcon size={23} />
          </a>
        </nav>
      </div>
      <div
        className={`fixed inset-0 top-[72px] z-40 bg-ink/20 backdrop-blur-[2px] transition-opacity duration-200 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden="true"
        onPointerDown={() => setOpen(false)}
      />
    </>
  );
}
