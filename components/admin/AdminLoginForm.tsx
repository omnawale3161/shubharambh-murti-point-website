"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { adminLoginAction, type ActionState } from "@/app/admin/actions";

const initialState: ActionState = {};

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(adminLoginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <form action={action} className="grid gap-5">
      <label className="grid gap-2 text-sm font-semibold text-stone-900">
        Email Address
        <span className="relative">
          <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
          <input required name="email" type="email" autoComplete="email" placeholder="admin@shubharambh.com" className="h-14 w-full rounded-lg border border-[#d6baaa] bg-white/70 pl-12 pr-4 text-base outline-none transition focus:border-[#8d4b00] focus:ring-4 focus:ring-[#8d4b00]/10" />
        </span>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-stone-900">
        <span className="flex items-center justify-between gap-3">
          Password
          <span className="text-sm font-semibold text-[#8d4b00]">Forgot Password?</span>
        </span>
        <span className="relative">
          <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
          <input required name="password" type={showPassword ? "text" : "password"} minLength={8} autoComplete="current-password" placeholder="Enter secure password" className="h-14 w-full rounded-lg border border-[#d6baaa] bg-white/70 pl-12 pr-12 text-base outline-none transition focus:border-[#8d4b00] focus:ring-4 focus:ring-[#8d4b00]/10" />
          <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-600" onClick={() => setShowPassword((value) => !value)}>
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </span>
      </label>
      <label className="flex items-center gap-3 text-sm font-medium text-stone-800">
        <input type="checkbox" className="size-5 rounded border-[#d6baaa] text-[#8d4b00]" />
        Remember this device for 30 days
      </label>
      {state.error ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p> : null}
      <button disabled={pending} className="flex min-h-14 items-center justify-center gap-3 rounded-lg bg-[#8d4b00] px-5 text-base font-black text-white shadow-[0_10px_20px_rgba(141,75,0,0.18)] transition hover:bg-[#753e00] disabled:opacity-50">
        <ShieldCheck size={20} />
        {pending ? "Signing in..." : "Secure Login"}
      </button>
    </form>
  );
}
