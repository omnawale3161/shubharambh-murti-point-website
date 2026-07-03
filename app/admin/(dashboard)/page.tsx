import Link from "next/link";
import { requireAdmin } from "@/lib/backend/auth";
import { formatPrice } from "@/lib/products";
import { getOrderPersistenceConfig, listOrders } from "@/lib/payments";

export default async function AdminDashboardPage() {
  const { supabase, profile } = await requireAdmin();
  const [products, orders] = await Promise.all([
    supabase.from("products").select("stock,reserved_stock,low_stock_threshold"),
    listOrders(getOrderPersistenceConfig())
  ]);
  const paidStatuses = new Set(["paid", "confirmed", "packed", "shipped", "delivered"]);
  const pendingStatuses = new Set(["created", "cod_pending", "payment_authorized"]);
  const totalRevenue = orders.filter((order) => paidStatuses.has(order.status)).reduce((sum, order) => sum + order.amount_paise, 0) / 100;
  const lowStock = (products.data || []).filter((product) => product.stock - product.reserved_stock > 0 && product.stock - product.reserved_stock <= product.low_stock_threshold).length;
  const outOfStock = (products.data || []).filter((product) => product.stock - product.reserved_stock <= 0).length;
  const metrics = [
    ["Total Orders", orders.length, "/admin/orders"],
    ["Total Revenue", formatPrice(totalRevenue), "/admin/reports"],
    ["Pending Orders", orders.filter((order) => pendingStatuses.has(order.status)).length, "/admin/orders?status=pending"],
    ["Paid Orders", orders.filter((order) => paidStatuses.has(order.status)).length, "/admin/orders?status=paid"],
    ["Low Stock Products", lowStock, "/admin/inventory?status=low"],
    ["Out of Stock Products", outOfStock, "/admin/inventory?status=out"]
  ] as const;

  return <><p className="section-kicker">Operations</p><h1 className="mt-2 text-4xl">Welcome, {profile.display_name || "Administrator"}</h1><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{metrics.map(([label, value, href]) => <Link key={label} href={href} className="rounded-lg border border-outline-variant bg-white p-5 shadow-card"><p className="text-sm font-bold text-on-surface-variant">{label}</p><p className="mt-2 text-3xl font-bold text-primary">{value}</p></Link>)}</div></>;
}
