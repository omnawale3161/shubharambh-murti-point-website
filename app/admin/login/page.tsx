import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminSession } from "@/lib/backend/auth";

export const metadata: Metadata = { title: "Admin Sign In", robots: { index: false, follow: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getAdminSession()) redirect("/admin");
  const { error } = await searchParams;
  return <main className="grid min-h-screen place-items-center bg-surface-container-low p-5"><section className="w-full max-w-md rounded-lg border border-outline-variant bg-white p-7 shadow-card"><p className="section-kicker">Protected workspace</p><h1 className="mt-2 text-3xl">Admin sign in</h1><p className="mb-6 mt-2 text-sm text-on-surface-variant">Use an approved Supabase administrator account.</p>{error === "unauthorized" ? <p role="alert" className="mb-5 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-800">This account does not have administrator access.</p> : null}<AdminLoginForm /></section></main>;
}
