"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="premium-container py-16" role="alert">
      <p className="section-kicker">Something went wrong</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
        We could not load this page.
      </h1>
      <p className="mt-5 max-w-2xl font-semibold leading-7 text-ink/68">
        Your cart and saved items are still safe. Try loading the page again or return to the collection.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          Try Again
        </button>
        <Link href="/collections" className="btn btn-secondary">
          Browse Collections
        </Link>
      </div>
    </main>
  );
}
