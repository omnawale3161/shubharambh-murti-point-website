"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  ["Home", "/"],
  ["Collections", "/collections"],
  ["About", "/about"],
  ["Contact", "/contact"],
  ["Account", "/account"]
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="hidden items-center gap-8 text-sm font-semibold text-on-surface-variant lg:flex">
      {nav.map(([label, href]) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(pathname, href) ? "page" : undefined}
          className="rounded-full border-b border-transparent px-3 py-2 transition hover:border-gold hover:text-primary aria-current:bg-primary aria-current:text-white aria-current:shadow-card"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function MobileHeaderNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {nav.map(([label, href]) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          aria-current={isActive(pathname, href) ? "page" : undefined}
          className="rounded-xl px-3 py-3 hover:bg-beige aria-current:bg-primary aria-current:text-white"
        >
          {label}
        </Link>
      ))}
    </>
  );
}
