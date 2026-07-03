"use client";

import { useActionState } from "react";
import { saveProductAction, type ActionState } from "@/app/admin/actions";
import type { Category, ProductRecord } from "@/lib/supabase/database.types";

const initialState: ActionState = {};
const input = "rounded-lg border border-outline-variant bg-white px-3 py-2";

export function ProductForm({ categories, product }: { categories: Category[]; product?: ProductRecord }) {
  const [state, action, pending] = useActionState(saveProductAction, initialState);
  return (
    <form action={action} className="grid gap-5">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold">Name<input required name="name" defaultValue={product?.name} className={input} /></label>
        <label className="grid gap-1 text-sm font-bold">Slug<input name="slug" defaultValue={product?.slug} className={input} placeholder="Generated from name" /></label>
        <label className="grid gap-1 text-sm font-bold">Category<select name="category_id" defaultValue={product?.category_id || ""} className={input}><option value="">Uncategorized</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label className="grid gap-1 text-sm font-bold">Badge<input name="badge" defaultValue={product?.badge || ""} className={input} /></label>
        <label className="grid gap-1 text-sm font-bold">Price (paise)<input required name="price_paise" type="number" min="0" defaultValue={product?.price_paise ?? 0} className={input} /></label>
        <label className="grid gap-1 text-sm font-bold">Compare price (paise)<input name="compare_at_price_paise" type="number" min="0" defaultValue={product?.compare_at_price_paise || ""} className={input} /></label>
        <label className="grid gap-1 text-sm font-bold">SKU<input required name="sku" defaultValue={product?.sku || ""} className={input} placeholder="smp-001" /></label>
        <label className="grid gap-1 text-sm font-bold">Current stock<input required name="stock" type="number" min="0" defaultValue={product?.stock ?? product?.stock_count ?? 0} className={input} /></label>
        <label className="grid gap-1 text-sm font-bold">Low stock threshold<input required name="low_stock_threshold" type="number" min="0" defaultValue={product?.low_stock_threshold ?? 5} className={input} /></label>
        <label className="grid gap-1 text-sm font-bold">Material<input name="material" defaultValue={product?.material} className={input} /></label>
        <label className="grid gap-1 text-sm font-bold">Size<input name="size" defaultValue={product?.size} className={input} /></label>
        <label className="grid gap-1 text-sm font-bold">Image URL<input name="image_url" type="url" defaultValue={product?.image_url || ""} className={input} /></label>
        <input type="hidden" name="image_path" value={product?.image_path || ""} />
      </div>
      <label className="grid gap-1 text-sm font-bold">Description<textarea name="description" defaultValue={product?.description} className={`${input} min-h-28`} /></label>
      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm font-bold"><input name="is_active" type="checkbox" defaultChecked={product?.is_active ?? true} />Active</label>
        <label className="flex items-center gap-2 text-sm font-bold"><input name="is_featured" type="checkbox" defaultChecked={product?.is_featured ?? false} />Featured</label>
      </div>
      {state.error ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p> : null}
      {state.success ? <p role="status" className="rounded-lg bg-green-50 p-3 text-sm font-bold text-green-800">{state.success}</p> : null}
      <button disabled={pending} className="w-fit rounded-lg bg-primary px-6 py-3 font-bold text-white disabled:opacity-50">{pending ? "Saving..." : "Save product"}</button>
    </form>
  );
}
