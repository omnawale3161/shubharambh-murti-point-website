import Link from "next/link";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Forgot Password", "Recover your Shubharambh account.", "/forgot-password");

export default function ForgotPasswordPage() {
  return (
    <main className="premium-container grid min-h-[70vh] place-items-center py-16">
      <section className="premium-card w-full max-w-lg rounded-3xl p-8 md:p-10">
        <p className="section-kicker">Account Recovery</p>
        <h1 className="mt-3 text-5xl text-primary">Forgot your password?</h1>
        <p className="mt-4 leading-7 text-on-surface-variant">Enter your account email. Password recovery delivery will be enabled with the production email provider.</p>
        <form action="/forgot-password/sent" className="mt-7 grid gap-4">
          <label className="grid gap-2 text-sm font-bold">Email<input required name="email" type="email" autoComplete="email" className="rounded-2xl border border-outline-variant bg-surface-container-low px-5 py-4 outline-hidden focus:border-gold" /></label>
          <button className="btn btn-primary rounded-xl">Send Recovery Link</button>
        </form>
        <Link href="/login" className="mt-6 inline-flex text-sm font-bold text-primary">Back to login</Link>
      </section>
    </main>
  );
}
