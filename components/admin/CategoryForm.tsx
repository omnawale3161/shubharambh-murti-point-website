"use client";

import { useActionState } from "react";
import { FolderTree, Save } from "lucide-react";
import { saveCategoryAction, type ActionState } from "@/app/admin/actions";
import type { Category } from "@/lib/supabase/database.types";

const input = "h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10";

export function CategoryForm({ category }: { category?: Category }) {
  const [state, action, pending] = useActionState(saveCategoryAction, {} as ActionState);
  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700"><FolderTree size={19} /></span>
        <div><h2 className="font-black text-slate-950">{category ? "Edit category" : "Create category"}</h2><p className="text-sm text-slate-500">Organize products for storefront browsing.</p></div>
      </div>
      <input required name="name" defaultValue={category?.name} placeholder="e.g. Ganapati Murti" className={input} />
      <input name="slug" defaultValue={category?.slug} placeholder="Auto-generated, e.g. ganapati-murti" className={input} />
      <textarea name="description" defaultValue={category?.description} placeholder="Short category text shown when this category appears on the home page." className={`${input} h-auto min-h-24 py-3`} />
      <input name="image_url" defaultValue={category?.image_url || ""} placeholder="Optional category image URL. If empty, the first active product image is used." className={input} />
      <input required name="sort_order" type="number" min="0" defaultValue={category?.sort_order ?? 0} placeholder="Sort order, e.g. 0, 1, 2" className={input} />
      <label className="flex items-center gap-3 text-sm font-black text-slate-800"><input name="is_active" type="checkbox" defaultChecked={category?.is_active ?? true} className="size-5" />Active</label>
      {state.error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p> : null}
      {state.success ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{state.success}</p> : null}
      <button disabled={pending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 text-sm font-black text-white shadow-lg shadow-amber-600/20 transition hover:bg-amber-700 disabled:opacity-50">
        <Save size={16} />{pending ? "Saving..." : category ? "Update" : "Create category"}
      </button>
    </form>
  );
}
