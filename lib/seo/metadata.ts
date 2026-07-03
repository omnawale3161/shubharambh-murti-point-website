import type { Metadata } from "next";
import type { Product } from "@/lib/products";
import { absoluteUrl, siteConfig } from "./config";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  image = siteConfig.defaultImage,
  noIndex = false
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    alternates: { canonical },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      images: [{ url: imageUrl, alt: title }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl]
    }
  };
}

export function createProductMetadata(product: Product): Metadata {
  const path = `/products/${product.slug}`;
  const title = `${product.name} - ${product.size}`;
  const description = `${product.description} ${product.material}. Secure packing and delivery support available.`;
  const metadata = createPageMetadata({ title, description, path, image: product.image });

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "website"
    }
  };
}

export const privatePageMetadata = (title: string, description: string, path: string) =>
  createPageMetadata({ title, description, path, noIndex: true });
