"use client";

import { useActionState } from "react";
import { adminLoginAction, type ActionState } from "@/app/admin/actions";

const initialState: ActionState = {};

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(adminLoginAction, initialState);
  return (
    <form action={action} className="grid gap-5">
      <label className="grid gap-2 text-sm font-bold">Email<input required name="email" type="email" autoComplete="email" className="rounded-lg border border-outline-variant bg-white px-4 py-3" /></label>
      <label className="grid gap-2 text-sm font-bold">Password<input required name="password" type="password" minLength={8} autoComplete="current-password" className="rounded-lg border border-outline-variant bg-white px-4 py-3" /></label>
      {state.error ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p> : null}
      <button disabled={pending} className="rounded-lg bg-primary px-5 py-3 font-bold text-white disabled:opacity-50">{pending ? "Signing in..." : "Sign in"}</button>
    </form>
  );
}

