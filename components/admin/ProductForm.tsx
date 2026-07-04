"use client";

import Image from "next/image";
import { useActionState } from "react";
import { BadgePercent, Eye, Package, Save } from "lucide-react";
import { saveProductAction, type ActionState } from "@/app/admin/actions";
import type { Category, ProductRecord } from "@/lib/supabase/database.types";

const initialState: ActionState = {};
const input = "h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10";
const label = "grid gap-1.5 text-sm font-black text-slate-800";

export function ProductForm({ categories, product }: { categories: Category[]; product?: ProductRecord }) {
  const [state, action, pending] = useActionState(saveProductAction, initialState);
  const hasDiscount = Boolean(product?.compare_at_price_paise && product.compare_at_price_paise > product.price_paise);

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[1fr_360px]">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <div className="grid gap-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700"><Package size={19} /></span>
            <div>
              <h2 className="text-lg font-black text-slate-950">Product Information</h2>
              <p className="text-sm text-slate-500">Core listing details shown across the storefront.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className={label}>Name<input required name="name" defaultValue={product?.name} className={input} /></label>
            <label className={label}>Slug<input name="slug" defaultValue={product?.slug} className={input} placeholder="Generated from name" /></label>
            <label className={label}>Category<select name="category_id" defaultValue={product?.category_id || ""} className={input}><option value="">Uncategorized</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label className={label}>SKU<input required name="sku" defaultValue={product?.sku || ""} className={input} placeholder="smp-001" /></label>
            <label className={label}>Material<input name="material" defaultValue={product?.material} className={input} /></label>
            <label className={label}>Size<input name="size" defaultValue={product?.size} className={input} /></label>
          </div>
          <label className={`${label} mt-4`}>Description<textarea name="description" defaultValue={product?.description} className={`${input} h-auto min-h-32 py-3 leading-6`} /></label>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><BadgePercent size={19} /></span>
            <div>
              <h2 className="text-lg font-black text-slate-950">Pricing and Stock</h2>
              <p className="text-sm text-slate-500">Set price, discount, inventory, and low-stock alerts.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className={label}>Price (paise)<input required name="price_paise" type="number" min="0" defaultValue={product?.price_paise ?? 0} className={input} /></label>
            <label className={label}>Compare price (paise)<input name="compare_at_price_paise" type="number" min="0" defaultValue={product?.compare_at_price_paise || ""} className={input} /></label>
            <label className={label}>Current stock<input required name="stock" type="number" min="0" defaultValue={product?.stock ?? product?.stock_count ?? 0} className={input} /></label>
            <label className={label}>Low stock threshold<input required name="low_stock_threshold" type="number" min="0" defaultValue={product?.low_stock_threshold ?? 5} className={input} /></label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-black text-slate-950">Media and merchandising</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className={label}>Image URL<input name="image_url" type="url" defaultValue={product?.image_url || ""} className={input} /></label>
            <label className={label}>Badge<input name="badge" defaultValue={product?.badge || ""} className={input} placeholder="Bestseller, New, Limited" /></label>
            <input type="hidden" name="image_path" value={product?.image_path || ""} />
          </div>
          <div className="mt-5 flex flex-wrap gap-4">
            <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-800"><input name="is_active" type="checkbox" defaultChecked={product?.is_active ?? true} className="size-5" />Active</label>
            <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-800"><input name="is_featured" type="checkbox" defaultChecked={product?.is_featured ?? false} className="size-5" />Featured</label>
            <span className="flex min-h-11 items-center rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-black text-amber-800">Use Badge = Bestseller for bestseller ribbon</span>
          </div>
        </section>

        {state.error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p> : null}
        {state.success ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{state.success}</p> : null}
        <button disabled={pending} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 text-sm font-black text-white shadow-lg shadow-amber-600/20 transition hover:bg-amber-700 disabled:opacity-50 sm:w-fit">
          <Save size={17} />
          {pending ? "Saving..." : "Save product"}
        </button>
      </div>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-slate-950">Product Preview</h2>
          <Eye size={18} className="text-slate-400" />
        </div>
        <div className="relative mt-5 aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {product?.image_url ? <Image src={product.image_url} alt={product.name} fill sizes="360px" className="object-contain p-5" /> : <div className="grid h-full place-items-center text-sm font-bold text-slate-400">Image preview</div>}
        </div>
        <p className="mt-5 text-xl font-black text-slate-950">{product?.name || "New product"}</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">{product?.description || "Add a short, premium product description for the listing."}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {hasDiscount ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Discount active</span> : null}
          {product?.is_featured ? <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">Featured</span> : null}
          {product?.badge ? <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">{product.badge}</span> : null}
        </div>
      </aside>
    </form>
  );
}
