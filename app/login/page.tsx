import { AuthForm } from "@/components/AuthForm";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Customer Login", "Login to your Shubharambh Murti Point account.", "/login");

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;
  const safeCallbackUrl = callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/account";

  return (
    <main className="premium-container grid min-h-[70vh] items-center gap-12 py-14 md:grid-cols-[0.9fr_1.1fr]">
      <section className="self-center">
        <p className="section-kicker">Customer Login</p>
        <h1 className="mt-3 text-5xl leading-tight text-primary md:text-6xl">Welcome back to your sanctuary.</h1>
        <p className="mt-5 text-lg leading-8 text-on-surface-variant">Login to save your details, manage orders, and continue shopping premium sacred artifacts.</p>
      </section>
      <AuthForm mode="login" callbackUrl={safeCallbackUrl} />
    </main>
  );
}
