import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/backend/auth";

export const metadata: Metadata = { title: "Store Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <div className="min-h-screen bg-surface-container-low md:grid md:grid-cols-[220px_1fr]"><AdminNav /><main className="min-w-0 p-5 md:p-8">{children}</main></div>;
}
