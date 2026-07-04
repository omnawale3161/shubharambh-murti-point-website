import Image from "next/image";
import nextDynamic from "next/dynamic";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { ProductCard } from "@/components/ProductCard";
import { ProductPurchasePanel } from "@/components/ProductPurchasePanel";
import {
  formatPrice,
  getProductByLegacySlug,
  getProductBySlug,
  isLegacyUuidSlug,
  productPath,
  products,
  ugcGallery
} from "@/lib/products";
import { breadcrumbSchema, createProductMetadata, productSchema } from "@/lib/seo";
import { getInventoryBySlug } from "@/lib/inventory";
import { getApprovedProductReviews } from "@/lib/reviews";

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

  const inventory = await getInventoryBySlug(product.slug);
  const productReviews = await getApprovedProductReviews(product.id);
  const reviewCount = productReviews.length;
  const averageRating = reviewCount ? (productReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount).toFixed(1) : null;
  const gallery = [product.image, ...ugcGallery.filter((image) => image !== product.image)].slice(0, 4);
  const relatedProducts = products.filter((item) => item.collection === product.collection && item.id !== product.id).slice(0, 5);

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
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div>
          <div className="product-image-frame relative h-[420px] rounded-3xl border border-outline-variant bg-white shadow-card sm:h-[500px] md:h-[680px]">
            <Image src={product.image} alt={product.name} fill priority fetchPriority="high" quality={78} sizes="(max-width:768px) 100vw, 50vw" className="object-contain p-3" />
          </div>
          <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2" aria-label="Product gallery">
            {gallery.map((image, index) => (
              <div key={image} className="relative h-20 w-20 shrink-0 snap-start overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-card md:h-24 md:w-24">
                <Image src={image} alt={`${product.name} gallery image ${index + 1}`} fill sizes="96px" quality={65} className="object-contain p-2" />
              </div>
            ))}
          </div>
        </div>
        <section className="self-center">
          <p className="section-kicker">{product.collection}</p>
          <h1 className="mt-3 text-5xl leading-tight text-primary md:text-6xl">{product.name}</h1>
          {averageRating ? <p className="mt-4 text-sm font-bold text-gold">★ {averageRating} rating · {reviewCount} customer reviews</p> : null}
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
        <ReviewsPanel initialReviews={productReviews} productId={product.id} />
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {ugcGallery.map((image, index) => (
            <div key={image} className="relative aspect-square overflow-hidden rounded-2xl border border-gold/20 bg-beige">
              <Image src={image} alt={`Customer shared murti photo ${index + 1}`} fill sizes="(max-width: 767px) 48vw, 280px" quality={65} className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      {relatedProducts.length ? (
        <section className="pb-16">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-kicker">You may also like</p>
              <h2 className="mt-3 text-4xl text-primary">Related Products</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
            {relatedProducts.map((item) => <ProductCard key={item.slug} product={item} />)}
          </div>
        </section>
      ) : null}
    </main>
  );
}
