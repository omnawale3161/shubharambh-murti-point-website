"use client";

import { useActionState } from "react";
import { ImagePlus, UploadCloud } from "lucide-react";
import { uploadProductImageAction, type ActionState } from "@/app/admin/actions";

export function ImageUploadForm() {
  const [state, action, pending] = useActionState(uploadProductImageAction, {} as ActionState);
  const uploaded = state.success?.split("|");
  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-100"><ImagePlus size={20} /></span>
        <div>
          <h2 className="text-lg font-black text-slate-950">Upload product images</h2>
          <p className="text-sm text-slate-500">Drag and drop or choose JPG, PNG, WebP, or AVIF files up to 5 MB.</p>
        </div>
      </div>
      <label className="grid cursor-pointer place-items-center rounded-2xl border border-dashed border-amber-300 bg-amber-50/40 px-5 py-8 text-center transition hover:bg-amber-50">
        <UploadCloud size={28} className="text-amber-700" />
        <span className="mt-3 text-sm font-black text-slate-950">Drop image here or browse</span>
        <span className="mt-1 text-xs font-semibold text-slate-500">Current storage action uploads one image at a time.</span>
        <input required type="file" name="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" />
      </label>
      <button disabled={pending} className="w-full min-h-11 rounded-xl bg-amber-600 px-4 py-2 text-sm font-black text-white shadow-lg shadow-amber-600/20 transition hover:bg-amber-700 disabled:opacity-50 sm:w-fit">{pending ? "Uploading..." : "Upload image"}</button>
      {state.error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p> : null}
      {uploaded ? <div className="grid gap-2 rounded-xl bg-emerald-50 p-3 text-sm"><p className="font-black text-emerald-800">Upload complete. Use this URL in the product form:</p><code className="overflow-auto rounded-lg bg-white p-2 text-xs text-slate-700">{uploaded[0]}</code><code className="overflow-auto rounded-lg bg-white p-2 text-xs text-slate-700">{uploaded[1]}</code></div> : null}
    </form>
  );
}
