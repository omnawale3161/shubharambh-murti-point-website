import { Percent, Plus, Trash2 } from "lucide-react";
import { AdminCard, AdminEmptyState, AdminPageHeader, AdminStatusBadge } from "@/components/admin/AdminUI";
import { requireAdmin } from "@/lib/backend/auth";

export default async function AdminCouponsPage() {
  await requireAdmin();

  return (
    <>
      <AdminPageHeader kicker="Promotions" title="Coupons" description="Create, edit, and retire discount coupons after a coupons table is connected." />
      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
        <AdminCard>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700"><Percent size={19} /></span>
            <div><h2 className="font-black text-slate-950">Create Coupon</h2><p className="text-sm text-slate-500">UI prepared for future coupon persistence.</p></div>
          </div>
          <div className="mt-5 grid gap-3">
            <input disabled placeholder="Coupon code" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm" />
            <input disabled placeholder="Discount percentage" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm" />
            <input disabled placeholder="Expiry date" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm" />
            <button disabled className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 text-sm font-black text-slate-500"><Plus size={16} />Create coupon</button>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-slate-950">Coupon List</h2>
            <AdminStatusBadge tone="amber">Not configured</AdminStatusBadge>
          </div>
          <div className="mt-5"><AdminEmptyState title="Coupons are not connected yet" description="No coupon table or API exists in the current backend. I did not add schema because the request asked to avoid database changes unless required." /></div>
          <div className="mt-5 flex gap-2 text-sm font-black text-slate-400"><Trash2 size={16} />Edit/delete controls will activate after persistence exists.</div>
        </AdminCard>
      </div>
    </>
  );
}
