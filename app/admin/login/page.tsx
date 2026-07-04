import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { Gift, Star } from "lucide-react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminSession } from "@/lib/backend/auth";

export const metadata: Metadata = { title: "Admin Sign In", robots: { index: false, follow: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getAdminSession()) redirect("/admin");
  const { error } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-[#fff8f5] p-4 sm:p-8">
      <section className="grid w-full max-w-6xl overflow-hidden rounded-3xl border border-[#f0ded2] bg-white shadow-[0_22px_80px_rgba(57,46,38,0.10)] lg:grid-cols-[1fr_1.25fr]">
        <div className="bg-[#fff8f5] p-6 sm:p-10 lg:p-14">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-xl bg-[#8d4b00] text-white shadow-lg shadow-[#8d4b00]/20">
              <Gift size={25} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[#8d4b00]">Shubharambh</h1>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#231a13]">Murti Point Admin</p>
            </div>
          </div>
          <div className="mt-12">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#8d4b00]">Protected workspace</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#231a13]">Welcome Back</h2>
            <p className="mt-4 max-w-md text-base leading-7 text-[#554336]">Access your management console to curate products, orders, inventory, and customer care with calm precision.</p>
          </div>
          {error === "unauthorized" ? <p role="alert" className="mt-6 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-800">This account does not have administrator access.</p> : null}
          <div className="mt-9">
            <AdminLoginForm />
          </div>
          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-[#ead8ce] pt-6 text-sm font-medium text-[#7b6252]">
            <p>2026 Shubharambh Murti Point</p>
            <div className="flex gap-5">
              <span>Privacy Policy</span>
              <span>Support</span>
            </div>
          </div>
        </div>
        <div className="relative hidden min-h-[640px] overflow-hidden bg-[#e9d7cb] lg:block">
          <Image src="/assets/showroom-hero.png" alt="Shubharambh admin workspace" fill priority sizes="55vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#231a13]/20 via-transparent to-[#8d4b00]/30" />
          <div className="absolute inset-x-8 bottom-10 rounded-3xl border border-white/50 bg-white/80 p-8 shadow-[0_24px_70px_rgba(35,26,19,0.20)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm font-semibold italic text-[#554336]">&quot;Empowering traditional craftsmanship with modern efficiency.&quot;</p>
                <h3 className="mt-6 text-2xl font-black text-[#231a13]">Shubharambh Ecosystem</h3>
                <p className="mt-2 text-[#554336]">Artisanal retail and inventory management</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#8d4b00]/20 bg-[#fff8f5] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#8d4b00]">
                <Star size={15} /> Premium
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
