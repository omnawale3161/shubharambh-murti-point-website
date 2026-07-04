import Link from "next/link";
import { BarChart3, Boxes, ClipboardList, FolderTree, LayoutDashboard, LogOut, MessagesSquare, Warehouse } from "lucide-react";
import { adminLogoutAction } from "@/app/admin/actions";

const links = [
  ["/admin", "Dashboard", LayoutDashboard],
  ["/admin/products", "Products", Boxes],
  ["/admin/orders", "Orders", ClipboardList],
  ["/admin/inventory", "Inventory", Warehouse],
  ["/admin/reports", "Reports", BarChart3],
  ["/admin/categories", "Categories", FolderTree],
  ["/admin/contacts", "Enquiries", MessagesSquare]
] as const;

export function AdminNav() {
  return (
    <aside className="sticky top-0 z-40 border-b border-outline-variant bg-white/95 p-4 backdrop-blur md:min-h-screen md:border-b-0 md:border-r">
      <Link href="/admin" className="font-serif text-xl font-bold text-primary">Store Admin</Link>
      <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 md:grid md:overflow-visible md:pb-0" aria-label="Admin navigation">
        {links.map(([href, label, Icon]) => <Link key={href} href={href} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold hover:bg-surface-container"><Icon size={17} />{label}</Link>)}
      </nav>
      <form action={adminLogoutAction} className="mt-5">
        <button className="btn btn-secondary min-h-10 rounded-lg px-3 py-2 text-sm"><LogOut size={17} />Sign out</button>
      </form>
    </aside>
  );
}
