import { updateContactStatusAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/backend/auth";
import type { ContactStatus } from "@/lib/supabase/database.types";

const statuses: ContactStatus[] = ["new", "in_progress", "resolved", "spam"];

export default async function AdminContactsPage() {
  const { supabase } = await requireAdmin();
  const { data: contacts, error } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return <><p className="section-kicker">Customer care</p><h1 className="mt-2 text-4xl">Enquiries</h1><div className="mt-8 grid gap-4">{contacts?.length ? contacts.map((contact) => <article key={contact.id} className="rounded-lg border border-outline-variant bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-bold">{contact.name}</h2><p className="text-sm text-on-surface-variant">{contact.phone}{contact.email ? ` · ${contact.email}` : ""}</p></div><form action={updateContactStatusAction} className="flex gap-2"><input type="hidden" name="id" value={contact.id} /><select name="status" defaultValue={contact.status} className="rounded-lg border border-outline-variant px-3 py-2">{statuses.map((status) => <option key={status}>{status}</option>)}</select><button className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white">Update</button></form></div><p className="mt-4 whitespace-pre-wrap">{contact.message}</p></article>) : <p className="rounded-lg border border-outline-variant bg-white p-5">No enquiries yet.</p>}</div></>;
}

