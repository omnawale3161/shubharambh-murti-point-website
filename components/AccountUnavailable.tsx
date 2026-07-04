import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export function AccountUnavailable({ message = "We could not load your account details right now." }: { message?: string }) {
  return (
    <main className="premium-container py-10 md:py-24">
      <section className="premium-card rounded-3xl p-6 md:p-9">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-maroon/10 text-maroon">
            <AlertTriangle size={24} />
          </span>
          <div>
            <p className="section-kicker">Account</p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-primary md:text-5xl">Account service unavailable.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">
              {message} This usually happens when the local server cannot reach Supabase from your current network.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="btn btn-secondary rounded-xl px-5 py-3">
                Login Again
              </Link>
              <Link href="/collections" className="btn btn-primary rounded-xl px-5 py-3">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
