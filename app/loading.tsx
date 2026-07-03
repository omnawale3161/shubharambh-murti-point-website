export default function Loading() {
  return (
    <main className="premium-container py-16" aria-live="polite" aria-busy="true">
      <p className="section-kicker">Shubharambh Murti Point</p>
      <h1 className="mt-3 text-4xl font-black sm:text-5xl">Preparing your experience...</h1>
      <div className="mt-10 grid gap-5 md:grid-cols-3" aria-hidden="true">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-56 animate-pulse rounded-2xl border border-gold/15 bg-beige" />
        ))}
      </div>
    </main>
  );
}
