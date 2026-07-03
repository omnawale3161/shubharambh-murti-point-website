"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

type Mode = "login" | "register";

async function jsonResponse(response: Response) {
  const body = await response.json() as { error?: string };
  if (!response.ok) throw new Error(body.error || "Authentication request failed.");
}

export function AuthForm({ mode, callbackUrl = "/account" }: { mode: Mode; callbackUrl?: string }) {
  const isRegister = mode === "register";
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");

    try {
      if (isRegister) {
        await jsonResponse(await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: String(form.get("name") || ""),
            email,
            phone: String(form.get("phone") || ""),
            password
          })
        }));
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        redirectTo: callbackUrl
      });

      if (result?.error) {
        throw new Error(isRegister ? "Account created, but automatic login failed. Please login." : "Invalid email or password.");
      }

      window.location.assign(result?.url || callbackUrl);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Authentication failed.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="premium-card grid gap-5 rounded-3xl p-7 md:p-9">
      {isRegister ? (
        <label className="grid gap-2 font-bold">
          Full name
          <input required name="name" autoComplete="name" minLength={2} maxLength={80} className="rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-4 focus:border-gold" placeholder="Your name" />
        </label>
      ) : null}
      <label className="grid gap-2 font-bold">
        Email
        <input required name="email" type="email" autoComplete="email" maxLength={254} className="rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-4 focus:border-gold" placeholder="you@example.com" />
      </label>
      {isRegister ? (
        <label className="grid gap-2 font-bold">
          Phone or WhatsApp
          <input required name="phone" type="tel" autoComplete="tel" minLength={10} maxLength={20} className="rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-4 focus:border-gold" placeholder="+91" />
        </label>
      ) : null}
      <label className="grid gap-2 font-bold">
        Password
        <input required name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} minLength={8} maxLength={128} className="rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-4 focus:border-gold" placeholder="Minimum 8 characters" />
      </label>
      {error ? <p className="rounded-2xl bg-maroon/10 px-4 py-3 text-sm font-bold text-maroon" role="alert">{error}</p> : null}
      <button disabled={isSubmitting} type="submit" className="btn btn-primary rounded-xl disabled:cursor-not-allowed disabled:bg-primary/45">
        {isSubmitting ? "Please wait..." : isRegister ? "Create Account" : "Login"}
      </button>
      {!isRegister ? <Link href="/forgot-password" className="text-center text-sm font-bold text-primary">Forgot password?</Link> : null}
      <p className="text-center text-sm font-semibold text-ink/62">
        {isRegister ? "Already have an account? " : "New customer? "}
        <Link href={isRegister ? "/login" : "/register"} className="font-black text-maroon">
          {isRegister ? "Login" : "Create account"}
        </Link>
      </p>
    </form>
  );
}
