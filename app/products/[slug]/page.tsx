import Image from "next/image";
import nextDynamic from "next/dynamic";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { ProductPurchasePanel } from "@/components/ProductPurchasePanel";
import {
  formatPrice,
  getProductByLegacySlug,
  getProductBySlug,
  isLegacyUuidSlug,
  productPath,
  productRating,
  products,
  reviews,
  ugcGallery
} from "@/lib/products";
import { breadcrumbSchema, createProductMetadata, productSchema } from "@/lib/seo";
import { getInventoryBySlug } from "@/lib/inventory";

const ReviewsPanel = nextDynamic(() => import("@/components/ReviewsPanel").then((module) => module.ReviewsPanel));
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  return product ? createProductMetadata(product) : {};
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    const legacyProduct = getProductByLegacySlug(slug);

    if (legacyProduct) {
      permanentRedirect(productPath(legacyProduct.slug));
    }

    if (isLegacyUuidSlug(slug)) {
      permanentRedirect("/collections");
    }

    notFound();
  }

  const stats = productRating(product);
  const inventory = await getInventoryBySlug(product.slug);

  return (
    <main className="premium-container py-14 md:py-20">
      <JsonLd data={[
        productSchema(product),
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Collections", path: "/collections" },
          { name: product.collection, path: `/collections?collection=${encodeURIComponent(product.collection)}` },
          { name: product.name, path: `/products/${product.slug}` }
        ])
      ]} />
      <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="product-image-frame relative h-[460px] rounded-3xl border border-outline-variant bg-white shadow-card md:h-[680px]">
          <Image src={product.image} alt={product.name} fill priority fetchPriority="high" quality={78} sizes="(max-width:768px) 100vw, 50vw" className="object-contain" />
        </div>
        <section className="self-center">
          <p className="section-kicker">{product.collection}</p>
          <h1 className="mt-3 text-5xl leading-tight text-primary md:text-6xl">{product.name}</h1>
          <p className="mt-4 text-sm font-bold text-gold">★ {stats.rating} rating · {stats.count} customer reviews</p>
          <p className="mt-5 text-lg leading-8 text-on-surface-variant">{product.description}</p>
          <p className="mt-5 inline-flex rounded-full border border-gold/30 bg-green-50 px-4 py-2 text-sm font-black text-green-800">🚚 Free Delivery Across India</p>
          <div className="mt-7 grid gap-3 text-sm font-bold text-ink/70">
            <p>Size: {product.size}</p>
            <p>Material: {product.material}</p>
            <p>Payment: UPI, Debit/Credit Cards, Net Banking, Wallets</p>
            <p>Delivery: Free delivery across India with safe packing and courier support.</p>
          </div>
          <p className="mt-8 text-4xl font-semibold text-primary">{formatPrice(product.price)}</p>
          <ProductPurchasePanel product={product} inventory={inventory} />
        </section>
      </div>

      <section className="grid gap-5 border-y border-gold/20 py-12 md:grid-cols-3">
        <div>
          <p className="section-kicker">Delivery</p>
          <h2 className="mt-3 text-2xl font-black">Packed for a safe journey</h2>
          <p className="mt-3 text-sm font-semibold leading-7 text-ink/65">Every murti is checked and securely packed with free delivery across India. Delivery time depends on idol size, pincode, and courier availability.</p>
        </div>
        <div>
          <p className="section-kicker">Pickup + Free Delivery</p>
          <h2 className="mt-3 text-2xl font-black">Flexible fulfilment</h2>
          <p className="mt-3 text-sm font-semibold leading-7 text-ink/65">Store pickup is available. Pune orders usually arrive fastest, with pan-India courier support prepared before dispatch.</p>
        </div>
        <div>
          <p className="section-kicker">Gift Ready</p>
          <h2 className="mt-3 text-2xl font-black">A thoughtful presentation</h2>
          <p className="mt-3 text-sm font-semibold leading-7 text-ink/65">Select gift-box packing to include premium presentation and a blessing card for festive or special occasions.</p>
        </div>
      </section>

      <section className="py-16">
        <p className="section-kicker">Reviews + UGC</p>
        <h2 className="mt-3 text-4xl font-black">Loved in homes across Maharashtra</h2>
        <ReviewsPanel initialReviews={reviews} />
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {ugcGallery.map((image, index) => (
            <div key={image} className="relative aspect-square overflow-hidden rounded-2xl border border-gold/20 bg-beige">
              <Image src={image} alt={`Customer shared murti photo ${index + 1}`} fill sizes="(max-width: 767px) 48vw, 280px" quality={65} className="object-cover" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
