import { Save } from "lucide-react";
import { updateContactStatusAction } from "@/app/admin/actions";
import { AdminCard, AdminEmptyState, AdminPageHeader, AdminStatusBadge } from "@/components/admin/AdminUI";
import { requireAdmin } from "@/lib/backend/auth";
import type { ContactStatus } from "@/lib/supabase/database.types";

const statuses: ContactStatus[] = ["new", "in_progress", "resolved", "spam"];

function tone(status: ContactStatus) {
  if (status === "resolved") return "green" as const;
  if (status === "in_progress") return "amber" as const;
  if (status === "spam") return "red" as const;
  return "blue" as const;
}

export default async function AdminContactsPage() {
  const { supabase } = await requireAdmin();
  const { data: contacts, error } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) throw error;

  return (
    <>
      <AdminPageHeader kicker="Customer Care" title="Enquiries" description="Manage customer messages, follow-up status, and support triage from one responsive queue." />
      <div className="mt-8 grid gap-4">
        {contacts?.length ? contacts.map((contact) => (
          <AdminCard key={contact.id}>
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-black text-slate-950">{contact.name}</h2>
                  <AdminStatusBadge tone={tone(contact.status)}>{contact.status.replace("_", " ")}</AdminStatusBadge>
                </div>
                <p className="mt-2 text-sm text-slate-500">{contact.phone}{contact.email ? ` · ${contact.email}` : ""}</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">{new Date(contact.created_at).toLocaleString("en-IN")}</p>
              </div>
              <form action={updateContactStatusAction} className="flex flex-wrap gap-2">
                <input type="hidden" name="id" value={contact.id} />
                <select name="status" defaultValue={contact.status} className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10">
                  {statuses.map((status) => <option key={status}>{status}</option>)}
                </select>
                <button className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-600 px-4 text-sm font-black text-white shadow-lg shadow-amber-600/20 transition hover:bg-amber-700"><Save size={16} />Update</button>
              </form>
            </div>
            <p className="mt-5 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 leading-7 text-slate-700">{contact.message}</p>
          </AdminCard>
        )) : <AdminEmptyState title="No enquiries yet" description="Contact form submissions will appear here for admin follow-up." />}
      </div>
    </>
  );
}
