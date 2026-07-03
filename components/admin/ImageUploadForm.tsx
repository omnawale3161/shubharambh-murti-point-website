"use client";

import { useActionState } from "react";
import { uploadProductImageAction, type ActionState } from "@/app/admin/actions";

export function ImageUploadForm() {
  const [state, action, pending] = useActionState(uploadProductImageAction, {} as ActionState);
  const uploaded = state.success?.split("|");
  return (
    <form action={action} className="grid gap-3 rounded-lg border border-outline-variant bg-white p-4">
      <h2 className="text-lg font-bold">Upload product image</h2>
      <input required type="file" name="file" accept="image/jpeg,image/png,image/webp,image/avif" />
      <button disabled={pending} className="w-fit rounded-lg bg-primary px-4 py-2 font-bold text-white">{pending ? "Uploading..." : "Upload"}</button>
      {state.error ? <p className="text-sm font-bold text-red-800">{state.error}</p> : null}
      {uploaded ? <div className="grid gap-1 text-sm"><p className="font-bold text-green-800">Upload complete. Use this URL in the product form:</p><code className="overflow-auto rounded bg-surface-container p-2">{uploaded[0]}</code><code className="overflow-auto rounded bg-surface-container p-2">{uploaded[1]}</code></div> : null}
    </form>
  );
}

