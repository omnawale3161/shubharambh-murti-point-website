"use client";

import { useActionState } from "react";
import { submitContactAction, type ContactActionState } from "@/app/contact/actions";
import { whatsappUrl } from "@/lib/products";

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContactAction, {} as ContactActionState);
  return (
    <form action={action} className="premium-card grid gap-5 rounded-3xl p-7">
      <label className="grid gap-2 font-bold">Name<input required name="name" autoComplete="name" minLength={2} maxLength={80} className="rounded-2xl border border-gold/25 bg-ivory px-4 py-4" placeholder="Your name" /></label>
      <label className="grid gap-2 font-bold">Email<input name="email" type="email" autoComplete="email" maxLength={254} className="rounded-2xl border border-gold/25 bg-ivory px-4 py-4" placeholder="you@example.com" /></label>
      <label className="grid gap-2 font-bold">Phone or WhatsApp<input required name="phone" type="tel" autoComplete="tel" minLength={10} maxLength={20} className="rounded-2xl border border-gold/25 bg-ivory px-4 py-4" placeholder="+91" /></label>
      <label className="grid gap-2 font-bold">Message<textarea required name="message" minLength={10} maxLength={2000} className="min-h-36 rounded-2xl border border-gold/25 bg-ivory px-4 py-4" placeholder="Tell us what murti you need" /></label>
      {state.error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-800">{state.error}</p> : null}
      {state.success ? <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm font-bold text-green-800">{state.success}</p> : null}
      <button disabled={pending} className="btn btn-primary disabled:opacity-50">{pending ? "Submitting..." : "Submit enquiry"}</button>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary text-sm">Continue on WhatsApp instead</a>
    </form>
  );
}
