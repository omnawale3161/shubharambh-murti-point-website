import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/products";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Search",
  description: "Search the Shubharambh Murti Point sacred collection.",
  path: "/search"
});

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = (await searchParams).q?.trim() || "";
  const normalized = query.toLowerCase();
  const results = normalized
    ? products.filter((product) => `${product.name} ${product.collection} ${product.material}`.toLowerCase().includes(normalized))
    : products;

  return (
    <main className="premium-container py-16 md:py-24">
      <p className="section-kicker">Find your sacred piece</p>
      <h1 className="mt-3 text-5xl text-primary md:text-6xl">Search Collection</h1>
      <form className="mt-8 flex max-w-2xl gap-3">
        <label htmlFor="site-search" className="sr-only">Search products</label>
        <input id="site-search" name="q" defaultValue={query} placeholder="Search Ganpati, Shivaji, Krishna..." className="min-h-12 flex-1 rounded-2xl border border-black bg-white px-5 outline-hidden focus:border-black" />
        <button className="btn btn-primary rounded-xl px-6">Search</button>
      </form>
      <p className="mt-8 text-sm font-bold text-on-surface-variant">{results.length} products found</p>
      <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </main>
  );
}
