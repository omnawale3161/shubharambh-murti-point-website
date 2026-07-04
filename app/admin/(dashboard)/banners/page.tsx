import { ImagePlus, ToggleLeft, UploadCloud } from "lucide-react";
import { AdminCard, AdminEmptyState, AdminPageHeader, AdminStatusBadge } from "@/components/admin/AdminUI";
import { requireAdmin } from "@/lib/backend/auth";

export default async function AdminBannersPage() {
  await requireAdmin();

  return (
    <>
      <AdminPageHeader kicker="Merchandising" title="Homepage Banners" description="Upload and enable homepage campaign banners when banner persistence is connected." />
      <div className="mt-8 grid gap-6 lg:grid-cols-[420px_1fr]">
        <AdminCard>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700"><ImagePlus size={19} /></span>
            <div><h2 className="font-black text-slate-950">Upload Banner</h2><p className="text-sm text-slate-500">Admin UI ready for desktop and mobile banner assets.</p></div>
          </div>
          <label className="mt-5 grid cursor-not-allowed place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
            <UploadCloud size={28} className="text-slate-400" />
            <span className="mt-3 text-sm font-black text-slate-500">Banner storage not configured</span>
            <input disabled type="file" className="sr-only" />
          </label>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-slate-950">Banner Campaigns</h2>
            <AdminStatusBadge tone="amber">Not configured</AdminStatusBadge>
          </div>
          <div className="mt-5"><AdminEmptyState title="No banner backend found" description="The current project has no banner table or API. I left the public homepage untouched and did not add schema automatically." /></div>
          <div className="mt-5 flex items-center gap-2 text-sm font-black text-slate-400"><ToggleLeft size={17} />Enable/disable controls will activate after banner persistence exists.</div>
        </AdminCard>
      </div>
    </>
  );
}
