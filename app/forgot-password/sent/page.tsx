import Link from "next/link";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Email Sent", "Password recovery email confirmation.", "/forgot-password/sent");

export default function RecoverySentPage() {
  return (
    <main className="premium-container grid min-h-[70vh] place-items-center py-16 text-center">
      <section className="premium-card max-w-lg rounded-3xl p-10">
        <p className="section-kicker">Check Your Inbox</p>
        <h1 className="mt-3 text-5xl text-primary">Email sent</h1>
        <p className="mt-5 leading-7 text-on-surface-variant">If an account exists for that email, recovery instructions will arrive shortly.</p>
        <Link href="/login" className="btn btn-primary mt-7 rounded-xl">Return to Login</Link>
      </section>
    </main>
  );
}
