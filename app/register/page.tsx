import { AuthForm } from "@/components/AuthForm";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Create Account", "Create your secure Shubharambh Murti Point account.", "/register");

export default function RegisterPage() {
  return (
    <main className="premium-container grid min-h-[70vh] items-center gap-12 py-14 md:grid-cols-[0.9fr_1.1fr]">
      <section className="self-center">
        <p className="section-kicker">Create Account</p>
        <h1 className="mt-3 text-5xl leading-tight text-primary md:text-6xl">Create your customer sanctuary.</h1>
        <p className="mt-5 text-lg leading-8 text-on-surface-variant">Save your details securely and view verified online orders from your account.</p>
      </section>
      <AuthForm mode="register" />
    </main>
  );
}
