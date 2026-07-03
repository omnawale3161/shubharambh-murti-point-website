"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return <section className="rounded-lg border border-red-200 bg-white p-6"><h1 className="text-2xl font-bold text-red-900">Admin data could not be loaded</h1><p className="mt-2 text-sm text-on-surface-variant">Check the Supabase environment variables, schema migration, and administrator role.</p><button onClick={reset} className="mt-5 rounded-lg bg-primary px-4 py-2 font-bold text-white">Try again</button></section>;
}

