import type { ProductCollection } from "./types";

export const primaryProductCategorySeeds = [
  { name: "Vithu Mauli", slug: "vithu-mauli" },
  { name: "Ganapati Murti", slug: "ganapati-murti" },
  { name: "Shiv Murti", slug: "shiv-murti" },
  { name: "Krishna Murti", slug: "krishna-murti" },
  { name: "Shree Ram Murti", slug: "shree-ram-murti" },
  { name: "Shivaji Maharaj Murti", slug: "shivaji-maharaj-murti" },
  { name: "Swami Samarth Murti", slug: "swami-samarth-murti" },
  { name: "Mushak", slug: "mushak" },
  { name: "Hanuman Murti", slug: "hanuman-murti" },
  { name: "Mavale Murti", slug: "shivaji-mharaj-mavale" },
] as const satisfies readonly {
  name: ProductCollection;
  slug: string;
}[];

export const defaultProductCollections: readonly ProductCollection[] =
  primaryProductCategorySeeds.map((category) => category.name);

const primaryCategoryNames = new Set(defaultProductCollections);
const primaryCategorySlugs = new Set<string>(
  primaryProductCategorySeeds.map((category) => category.slug)
);

export function isPrimaryProductCategoryName(name: string) {
  return primaryCategoryNames.has(name);
}

export function isPrimaryProductCategorySlug(slug: string) {
  return primaryCategorySlugs.has(slug);
}

export function isPrimaryProductCategory(name: string, slug?: string | null) {
  return (
    isPrimaryProductCategoryName(name) &&
    (!slug || isPrimaryProductCategorySlug(slug))
  );
}
