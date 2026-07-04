import Link from "next/link";
import { Mail, Phone, ShoppingBag } from "lucide-react";
import { AdminCard, AdminEmptyState, AdminPageHeader, AdminStatusBadge, AdminTableShell } from "@/components/admin/AdminUI";
import { requireAdmin } from "@/lib/backend/auth";
import { getOrderPersistenceConfig, listOrders } from "@/lib/payments";
import { formatPrice } from "@/lib/products";

export default async function AdminCustomersPage() {
  const { supabase } = await requireAdmin();
  const [orders, profiles] = await Promise.all([
    listOrders(getOrderPersistenceConfig()),
    supabase.from("profiles").select("id,display_name,role,created_at").eq("role", "customer").order("created_at", { ascending: false }).limit(100)
  ]);

  const customers = new Map<string, {
    key: string;
    name: string;
    email: string;
    phone: string;
    orders: number;
    revenue: number;
    lastOrder?: string;
  }>();

  orders.forEach((order) => {
    const key = order.customer_email || order.customer_phone || order.customer_id || order.id;
    const current = customers.get(key) || {
      key,
      name: order.delivery_address?.fullName || "Customer",
      email: order.customer_email || "",
      phone: order.customer_phone || "",
      orders: 0,
      revenue: 0,
      lastOrder: order.created_at
    };
    current.orders += 1;
    current.revenue += order.amount_paise;
    if (order.created_at && (!current.lastOrder || order.created_at > current.lastOrder)) current.lastOrder = order.created_at;
    customers.set(key, current);
  });

  const rows = [...customers.values()].sort((a, b) => (b.lastOrder || "").localeCompare(a.lastOrder || ""));

  return (
    <>
      <AdminPageHeader kicker="Customers" title="Customer List" description="Review customer profiles, order history signals, lifetime revenue, and contact details." />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <AdminCard><p className="text-sm font-bold text-slate-500">Known customers</p><p className="mt-2 text-3xl font-black text-slate-950">{rows.length}</p></AdminCard>
        <AdminCard><p className="text-sm font-bold text-slate-500">Registered profiles</p><p className="mt-2 text-3xl font-black text-amber-700">{profiles.data?.length || 0}</p></AdminCard>
        <AdminCard><p className="text-sm font-bold text-slate-500">Customer revenue</p><p className="mt-2 text-3xl font-black text-emerald-700">{formatPrice(rows.reduce((sum, row) => sum + row.revenue, 0) / 100)}</p></AdminCard>
      </div>
      <div className="mt-8">
        <AdminTableShell>
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
              <tr><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Contact</th><th className="px-5 py-4">Orders</th><th className="px-5 py-4">Revenue</th><th className="px-5 py-4">Last Order</th><th className="px-5 py-4">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((customer) => (
                <tr key={customer.key} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4"><p className="font-black text-slate-950">{customer.name}</p><p className="mt-1 font-mono text-xs text-slate-500">{customer.key}</p></td>
                  <td className="px-5 py-4"><p className="flex items-center gap-2 text-slate-700"><Mail size={15} className="text-slate-400" />{customer.email || "No email"}</p><p className="mt-1 flex items-center gap-2 text-slate-700"><Phone size={15} className="text-slate-400" />{customer.phone || "No phone"}</p></td>
                  <td className="px-5 py-4"><AdminStatusBadge tone="blue"><ShoppingBag size={14} className="mr-1" />{customer.orders}</AdminStatusBadge></td>
                  <td className="px-5 py-4 font-black text-slate-950">{formatPrice(customer.revenue / 100)}</td>
                  <td className="px-5 py-4 text-slate-600">{customer.lastOrder ? new Date(customer.lastOrder).toLocaleString("en-IN") : "Unavailable"}</td>
                  <td className="px-5 py-4"><Link href={`/admin/orders?q=${encodeURIComponent(customer.email || customer.phone)}`} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-900 transition hover:border-amber-300 hover:text-amber-700">Order history</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length ? <div className="p-5"><AdminEmptyState title="No customers yet" description="Customers will appear after orders are created or profiles register." /></div> : null}
        </AdminTableShell>
      </div>
    </>
  );
}
