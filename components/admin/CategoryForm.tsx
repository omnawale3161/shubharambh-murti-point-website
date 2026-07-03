"use client";

import { useActionState } from "react";
import { saveCategoryAction, type ActionState } from "@/app/admin/actions";
import type { Category } from "@/lib/supabase/database.types";

export function CategoryForm({ category }: { category?: Category }) {
  const [state, action, pending] = useActionState(saveCategoryAction, {} as ActionState);
  return (
    <form action={action} className="grid gap-3 rounded-lg border border-outline-variant bg-white p-4">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <input required name="name" defaultValue={category?.name} placeholder="Category name" className="rounded-lg border border-outline-variant px-3 py-2" />
      <input name="slug" defaultValue={category?.slug} placeholder="Slug generated from name" className="rounded-lg border border-outline-variant px-3 py-2" />
      <textarea name="description" defaultValue={category?.description} placeholder="Description" className="min-h-20 rounded-lg border border-outline-variant px-3 py-2" />
      <input required name="sort_order" type="number" min="0" defaultValue={category?.sort_order ?? 0} className="rounded-lg border border-outline-variant px-3 py-2" />
      <label className="flex items-center gap-2 text-sm font-bold"><input name="is_active" type="checkbox" defaultChecked={category?.is_active ?? true} />Active</label>
      {state.error ? <p className="text-sm font-bold text-red-800">{state.error}</p> : null}
      {state.success ? <p className="text-sm font-bold text-green-800">{state.success}</p> : null}
      <button disabled={pending} className="rounded-lg bg-primary px-4 py-2 font-bold text-white">{pending ? "Saving..." : category ? "Update" : "Create category"}</button>
    </form>
  );
}

