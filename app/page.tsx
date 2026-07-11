import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { instagramUrl, ugcGallery } from "@/lib/products";
import { createPageMetadata } from "@/lib/seo";
import { getInventoryMap } from "@/lib/inventory";
import { getStorefrontCategoryTiles } from "@/lib/products/storefront";

export const metadata = createPageMetadata({
  title: "Premium Handcrafted Murtis & Spiritual Decor",
  description: "Shop premium handcrafted murtis, devotional idols, gift-ready spiritual decor, free home delivery offers, and sacred home mandir pieces from Shubharambh Murti Point.",
  path: "/"
});

const instagramGallery = [
  ...ugcGallery,
  "/assets/bappa5.png",
  "/assets/bappa7.png"
].slice(0, 6);

const stats = [
  ["50+", "Curated designs"],
  ["4.9/5", "Customer love"],
  ["Free", "Home delivery"],
  ["Safe", "Secure packing"]
];

export default async function HomePage() {
  const [categoryProducts, inventory] = await Promise.all([
    getStorefrontCategoryTiles(),
    getInventoryMap()
  ]);

  return (
    <main>
      <section className="premium-container grid min-h-[720px] items-center gap-12 py-16 md:grid-cols-[0.95fr_1.05fr]">
        <div className="soft-animate">
          <p className="section-kicker">Shubharambh Murti Point</p>
          <p className="mt-4 inline-flex rounded-full border border-gold/30 bg-white px-4 py-2 text-sm font-black text-primary shadow-card">🇮🇳 Free Delivery Across India | Secure Payments | Fast Dispatch</p>
          <h1 className="mt-5 max-w-3xl text-5xl leading-[0.98] text-primary sm:text-6xl lg:text-7xl">
            Sacred artistry for modern Indian homes.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-on-surface-variant">
            Premium handcrafted murtis, devotional idols, and gift-ready spiritual decor selected for auspicious beginnings.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/collections" className="btn btn-primary">
              Explore Collection
            </Link>
            <Link href="/about" className="btn btn-secondary">
              Our Story
            </Link>
          </div>
          <div className="mt-12 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-card">
                <p className="text-2xl font-semibold text-primary">{value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-on-surface-variant">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 rounded-[2rem] bg-gold/20 blur-2xl md:-inset-4" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-outline-variant bg-surface-container shadow-hover">
            <Image src="/assets/showroom-hero.png" alt="Premium murti collection at Shubharambh Murti Point" fill priority fetchPriority="high" quality={82} sizes="(max-width: 767px) calc(100vw - 40px), 50vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low py-12 md:py-14">
        <div className="premium-container">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-kicker">Curated collection</p>
              <h2 className="mt-3 text-4xl text-primary md:text-5xl">Shop by Category</h2>
            </div>
            <Link href="/collections" className="btn btn-secondary">
              View All Products
            </Link>
          </div>
          {categoryProducts.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {categoryProducts.map(({ category, product }) => (
                <ProductCard
                  key={category.slug}
                  product={{
                    ...product,
                    image: category.image_url || product.image,
                    collection: category.name,
                    description: category.description || product.description
                  }}
                  inventory={inventory[product.slug]}
                  showSecondaryActions={false}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-outline-variant bg-white p-6 text-center shadow-card">
              <p className="font-black text-primary">New collections are being prepared.</p>
              <p className="mt-2 text-sm text-on-surface-variant">Please check back soon for fresh devotional pieces.</p>
            </div>
          )}
        </div>
      </section>

      <section className="premium-container grid items-center gap-12 py-20 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-outline-variant shadow-card">
          <Image src="/assets/bappa5.png" alt="Premium devotional murti finish" fill sizes="(max-width: 767px) calc(100vw - 40px), 50vw" className="object-cover" />
        </div>
        <div>
          <p className="section-kicker">Our craft</p>
          <h2 className="mt-3 text-4xl text-primary md:text-5xl">Created for devotion, gifting, and sacred spaces.</h2>
          <p className="mt-6 leading-8 text-on-surface-variant">
            Each murti is selected for expression, finish, and presence, with careful packing for gifting, festivals, home mandirs, and spiritual corners.
          </p>
          <Link href="/about" className="btn btn-secondary mt-8">
            Learn More
          </Link>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="premium-container grid gap-5 md:grid-cols-3">
          {["Free Delivery Across India", "Secure Razorpay Payments", "Fast Dispatch + Safe Packaging"].map((item) => (
            <div key={item} className="rounded-3xl border border-gold/20 bg-ivory p-6 shadow-card">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-gold">Store Promise</p>
              <h2 className="mt-3 text-2xl text-primary">{item}</h2>
            </div>
          ))}
        </div>
      </section>

      <section className="premium-container pb-16">
        <div className="rounded-[2rem] border border-gold/20 bg-beige p-6 shadow-card md:p-9">
          <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-kicker">Instagram Gallery</p>
              <h2 className="mt-3 flex items-center gap-3 text-4xl font-black text-primary">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-lg font-black text-white shadow-card" aria-hidden="true">
                  IG
                </span>
                Follow @shubharambh.murti
              </h2>
              <p className="mt-4 max-w-2xl text-ink/68">See new arrivals, customer favorites, festive product videos, and real packing updates.</p>
            </div>
            <a href={instagramUrl} target="_blank" rel="noreferrer" className="btn btn-secondary w-fit">
              View Instagram
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {instagramGallery.map((image, index) => (
              <a key={image} href={instagramUrl} target="_blank" rel="noreferrer" className="group relative aspect-square overflow-hidden rounded-2xl border border-gold/20 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-hover" aria-label="View Shubharambh Murti Point on Instagram">
                <Image src={image} alt={`Shubharambh Murti Point Instagram gallery image ${index + 1}`} fill sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 16vw" quality={72} className="object-cover transition duration-500 group-hover:scale-110" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
