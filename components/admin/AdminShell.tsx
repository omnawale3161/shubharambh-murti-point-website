"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  Boxes,
  ChevronLeft,
  ClipboardList,
  FolderTree,
  Gift,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Menu,
  MessagesSquare,
  Moon,
  Percent,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Sun,
  Users,
  Warehouse
} from "lucide-react";
import { adminLogoutAction } from "@/app/admin/actions";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/coupons", label: "Coupons", icon: Percent },
  { href: "/admin/banners", label: "Banners", icon: ImagePlus },
  { href: "/admin/reports", label: "Analytics", icon: BarChart3 },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/contacts", label: "Enquiries", icon: MessagesSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings }
] as const;

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

export function AdminShell({
  children,
  displayName
}: {
  children: React.ReactNode;
  displayName?: string | null;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const nav = useMemo(() => (
    <nav className="mt-6 grid gap-1" aria-label="Admin navigation">
      {links.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${
              active
                ? "bg-amber-600 text-white shadow-[0_12px_24px_rgba(217,119,6,0.22)]"
                : dark
                  ? "text-stone-200 hover:bg-white/10"
                  : "text-stone-700 hover:bg-amber-50 hover:text-amber-800"
            } ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="shrink-0" />
            <span className={collapsed ? "sr-only" : ""}>{label}</span>
          </Link>
        );
      })}
    </nav>
  ), [collapsed, dark, pathname]);

  const sidebar = (
    <aside className={`flex h-full flex-col border-r ${dark ? "border-white/10 bg-[#231a13] text-white" : "border-amber-100 bg-[#fff8f5] text-slate-950"} px-4 py-5 transition-all duration-300 ${collapsed ? "md:w-[88px]" : "md:w-[264px]"}`}>
      <div className={`flex items-center gap-3 ${collapsed ? "md:justify-center" : ""}`}>
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-700 text-white shadow-lg shadow-amber-900/10">
          <Gift size={22} />
        </div>
        <div className={collapsed ? "md:sr-only" : ""}>
          <p className="text-xl font-black leading-none text-amber-800">Shubharambh</p>
          <p className={`mt-1 text-[11px] font-bold uppercase tracking-[0.2em] ${dark ? "text-stone-300" : "text-stone-600"}`}>Murti Point Admin</p>
        </div>
      </div>
      {nav}
      <div className="mt-auto grid gap-3 pt-6">
        <div className={`rounded-2xl border p-3 ${collapsed ? "md:hidden" : ""} ${dark ? "border-white/10 bg-white/5" : "border-amber-100 bg-white"}`}>
          <div className="flex items-center gap-2 text-sm font-black">
            <ShieldCheck size={17} className="text-emerald-600" />
            Secure workspace
          </div>
          <p className={`mt-1 text-xs leading-5 ${dark ? "text-stone-300" : "text-stone-600"}`}>Protected Supabase admin access for store operations.</p>
        </div>
        <form action={adminLogoutAction}>
          <button className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-3 text-sm font-black transition ${dark ? "border-white/15 text-white hover:bg-white/10" : "border-amber-200 bg-white text-amber-900 hover:bg-amber-50"}`}>
            <LogOut size={17} />
            <span className={collapsed ? "md:sr-only" : ""}>Sign out</span>
          </button>
        </form>
      </div>
    </aside>
  );

  return (
    <div className={`min-h-screen ${dark ? "bg-[#17120e] text-stone-100" : "bg-slate-50 text-slate-950"}`}>
      <div className={`fixed inset-y-0 left-0 z-40 hidden transition-all duration-300 md:block ${collapsed ? "w-[88px]" : "w-[264px]"}`}>
        {sidebar}
      </div>
      <div className={`fixed inset-0 z-50 transition md:hidden ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <button aria-label="Close admin menu" className={`absolute inset-0 bg-slate-950/40 transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setDrawerOpen(false)} />
        <div className={`absolute inset-y-0 left-0 w-[84vw] max-w-[320px] transition-transform duration-300 ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {sidebar}
        </div>
      </div>
      <div className={`transition-all duration-300 ${collapsed ? "md:pl-[88px]" : "md:pl-[264px]"}`}>
        <header className={`sticky top-0 z-30 border-b backdrop-blur-xl ${dark ? "border-white/10 bg-[#17120e]/88" : "border-slate-200 bg-slate-50/88"}`}>
          <div className="flex min-h-16 items-center gap-3 px-4 md:px-6">
            <button aria-label="Open admin menu" className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-800 md:hidden" onClick={() => setDrawerOpen(true)}>
              <Menu size={20} />
            </button>
            <button aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className={`hidden size-10 place-items-center rounded-xl border md:grid ${dark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-white text-slate-800"}`} onClick={() => setCollapsed((value) => !value)}>
              <ChevronLeft size={18} className={`transition ${collapsed ? "rotate-180" : ""}`} />
            </button>
            <label className={`relative hidden min-w-0 flex-1 lg:block ${dark ? "text-stone-300" : "text-slate-500"}`}>
              <span className="sr-only">Search admin</span>
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2" />
              <input placeholder="Search products, orders, customers..." className={`h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 ${dark ? "border-white/10 bg-white/5 text-white placeholder:text-stone-400" : "border-slate-200 bg-white text-slate-950"}`} />
            </label>
            <button aria-label="Toggle color mode" className={`grid size-10 place-items-center rounded-xl border ${dark ? "border-white/10 bg-white/5 text-amber-200" : "border-slate-200 bg-white text-slate-800"}`} onClick={() => setDark((value) => !value)}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button aria-label="Notifications" className={`relative grid size-10 place-items-center rounded-xl border ${dark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-white text-slate-800"}`}>
              <Bell size={18} />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-amber-500" />
            </button>
            <div className={`hidden items-center gap-3 rounded-xl border px-3 py-2 sm:flex ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
              <div className="grid size-8 place-items-center rounded-full bg-amber-100 text-xs font-black text-amber-800">{(displayName || "A").slice(0, 1).toUpperCase()}</div>
              <div>
                <p className="text-sm font-black leading-none">{displayName || "Admin"}</p>
                <p className={`mt-1 text-[11px] font-bold ${dark ? "text-stone-400" : "text-slate-500"}`}>Store manager</p>
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}
