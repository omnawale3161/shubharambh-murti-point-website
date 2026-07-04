import { CreditCard, Globe, IndianRupee, Search, Settings, Share2, Store } from "lucide-react";
import { AdminCard, AdminPageHeader, AdminStatusBadge } from "@/components/admin/AdminUI";
import { requireAdmin } from "@/lib/backend/auth";

const sections = [
  { title: "Store Details", description: "Business name, support email, phone, and address.", icon: Store, status: "Configured in code/env" },
  { title: "GST", description: "Tax identity and invoice settings.", icon: IndianRupee, status: "Manual setup" },
  { title: "Shipping Charges", description: "Store currently promotes free delivery across India.", icon: Globe, status: "Free delivery" },
  { title: "Payment Settings", description: "Razorpay keys are loaded from environment variables.", icon: CreditCard, status: "Env based" },
  { title: "SEO Settings", description: "Public metadata remains managed by existing pages.", icon: Search, status: "Public UI untouched" },
  { title: "Social Links", description: "Instagram and WhatsApp links can be centralized here when persistence exists.", icon: Share2, status: "Manual setup" }
];

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <>
      <AdminPageHeader kicker="Configuration" title="Settings" description="Operational settings overview for store, GST, shipping, payments, SEO, and social links." />
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map(({ title, description, icon: Icon, status }) => (
          <AdminCard key={title}>
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-100"><Icon size={20} /></span>
              <AdminStatusBadge tone="slate">{status}</AdminStatusBadge>
            </div>
            <h2 className="mt-5 text-lg font-black text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            <button disabled className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-400"><Settings size={16} />Edit settings</button>
          </AdminCard>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-900">
        I did not move secrets or payment configuration into the database. Production-sensitive values should continue to live in environment variables unless you approve a dedicated settings schema.
      </div>
    </>
  );
}
