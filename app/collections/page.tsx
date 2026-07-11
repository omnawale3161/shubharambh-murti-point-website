import type { Metadata } from "next";
import { CollectionBrowser } from "@/components/CollectionBrowser";
import { createPageMetadata } from "@/lib/seo";
import { getInventoryMap } from "@/lib/inventory";
import { getStorefrontCollections, getStorefrontProducts } from "@/lib/products/storefront";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ collection?: string }> }): Promise<Metadata> {
  const { collection } = await searchParams;
  const collections = await getStorefrontCollections();
  const validCollection = collections.find((item) => item === collection);

  return createPageMetadata({
    title: validCollection ? validCollection : "Murti Collections",
    description: validCollection
      ? `Explore premium ${validCollection} designs, sizes, finishes, gift options, and secure delivery support.`
      : "Explore premium murti collections for home mandirs, gifting, festivals, offices, and spiritual spaces.",
    path: validCollection ? `/collections?collection=${encodeURIComponent(validCollection)}` : "/collections"
  });
}

export default async function CollectionsPage({ searchParams }: { searchParams: Promise<{ collection?: string }> }) {
  const { collection: selected } = await searchParams;
  const [collections, products, inventory] = await Promise.all([
    getStorefrontCollections(),
    getStorefrontProducts(),
    getInventoryMap()
  ]);

  return (
    <main>
      <section className="bg-surface-container-low py-16 text-center md:py-24">
        <p className="section-kicker">Curated Sacred Artifacts</p>
        <h1 className="mt-3 text-5xl text-primary md:text-6xl">Divine Collections</h1>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-on-surface-variant">Discover our carefully curated collection of divine murtis, handcrafted to bring blessings, peace, and positivity into your home.</p>
      </section>
      <div className="premium-container py-12 md:py-16">
      <CollectionBrowser collections={collections} products={products} inventory={inventory} selectedCollection={selected} />
      </div>
    </main>
  );
}
