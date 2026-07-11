"use client";

import Image from "next/image";
import { useActionState, useMemo, useState } from "react";
import { BadgePercent, Eye, Package, Save } from "lucide-react";
import { saveProductAction, type ActionState } from "@/app/admin/actions";
import type { Category, ProductRecord } from "@/lib/supabase/database.types";

const initialState: ActionState = {};
const input = "h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10";
const label = "grid gap-1.5 text-sm font-black text-slate-800";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 180);
}

function uniqueSlug(value: string, existingSlugs: readonly string[]) {
  const base = slugify(value);
  if (!base) return "";
  const taken = new Set(existingSlugs);
  if (!taken.has(base)) return base;

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

export function ProductForm({ categories, existingSlugs = [], product }: { categories: Category[]; existingSlugs?: string[]; product?: ProductRecord }) {
  const [state, action, pending] = useActionState(saveProductAction, initialState);
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [slugEdited, setSlugEdited] = useState(Boolean(product?.slug));
  const hasDiscount = Boolean(product?.compare_at_price_paise && product.compare_at_price_paise > product.price_paise);
  const slugTaken = useMemo(() => Boolean(slug && existingSlugs.includes(slug)), [existingSlugs, slug]);

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
            <label className={label}>Name<input required name="name" value={name} onChange={(event) => {
              const nextName = event.target.value;
              setName(nextName);
              if (!slugEdited) setSlug(uniqueSlug(nextName, existingSlugs));
            }} className={input} placeholder="e.g. Ganapati Bappa" /></label>
            <label className={label}>Slug<input name="slug" value={slug} onChange={(event) => {
              setSlugEdited(true);
              setSlug(slugify(event.target.value));
            }} className={`${input} ${slugTaken ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : ""}`} placeholder="Auto-generated, e.g. ganapati-bappa" />{slugTaken ? <span className="text-xs font-bold text-red-700">This slug is already used by another product.</span> : <span className="text-xs font-semibold text-slate-500">Must be unique. It is used in the product URL.</span>}</label>
            <label className={label}>Category<select required name="category_id" defaultValue={product?.category_id || ""} className={input}><option value="" disabled>Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label className={label}>SKU<input required name="sku" defaultValue={product?.sku || ""} className={input} placeholder="e.g. smp-001 or ganapati-001" /></label>
            <label className={label}>Material<input name="material" defaultValue={product?.material} className={input} placeholder="e.g. Marble dust finish" /></label>
            <label className={label}>Size<input name="size" defaultValue={product?.size} className={input} placeholder="e.g. 5 inch" /></label>
          </div>
          <label className={`${label} mt-4`}>Description<textarea name="description" defaultValue={product?.description} className={`${input} h-auto min-h-32 py-3 leading-6`} placeholder="Write the product details customers should see on the product page." /></label>
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
            <label className={label}>Price (₹)<input required name="price_rupees" type="number" min="0" step="0.01" defaultValue={product ? product.price_paise / 100 : ""} className={input} placeholder="e.g. 999" /><span className="text-xs font-semibold text-slate-500">Enter rupees. The system stores it internally as paise.</span></label>
            <label className={label}>Compare price (₹)<input name="compare_at_price_rupees" type="number" min="0" step="0.01" defaultValue={product?.compare_at_price_paise ? product.compare_at_price_paise / 100 : ""} className={input} placeholder="Optional, e.g. 1100" /></label>
            <label className={label}>Current stock<input required name="stock" type="number" min="0" defaultValue={product ? product.stock ?? product.stock_count ?? 0 : ""} className={input} placeholder="e.g. 10" /><span className="text-xs font-semibold text-slate-500">Use 0 only when the product should be out of stock.</span></label>
            <label className={label}>Low stock threshold<input required name="low_stock_threshold" type="number" min="0" defaultValue={product?.low_stock_threshold ?? 5} className={input} placeholder="e.g. 5" /></label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-black text-slate-950">Media and merchandising</h2>
          <div className="mt-5 grid gap-4">
            <label className={label}>Primary image URL or asset path<input name="image_url" defaultValue={product?.image_url || ""} className={input} placeholder="https://.../ganapati-front.jpg or /assets/ganapati-front.jpg" /><span className="text-xs font-semibold text-slate-500">This image is used on cards, search, cart, and as the first product detail image.</span></label>
            <label className={label}>Gallery image URLs<textarea name="image_urls" defaultValue={(product?.image_urls || []).join("\n")} className={`${input} h-auto min-h-28 py-3 leading-6`} placeholder={"Optional extra images, one per line:\nhttps://.../ganapati-side.jpg\nhttps://.../ganapati-back.jpg"} /><span className="text-xs font-semibold text-slate-500">Paste extra product image URLs here. Do not add unrelated customer or catalog images.</span></label>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className={label}>Badge<input name="badge" defaultValue={product?.badge || ""} className={input} placeholder="e.g. Bestseller, New, Limited" /></label>
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
        <button disabled={pending || slugTaken} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 text-sm font-black text-white shadow-lg shadow-amber-600/20 transition hover:bg-amber-700 disabled:opacity-50 sm:w-fit">
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
        {product?.image_urls?.length ? <p className="mt-3 text-xs font-bold text-slate-500">{product.image_urls.length} gallery image{product.image_urls.length === 1 ? "" : "s"} added</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {hasDiscount ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Discount active</span> : null}
          {product?.is_featured ? <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">Featured</span> : null}
          {product?.badge ? <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">{product.badge}</span> : null}
        </div>
      </aside>
    </form>
  );
}
