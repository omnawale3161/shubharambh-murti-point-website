export type ProductCollection =
  | "Ganpati Murti"
  | "Shivaji Maharaj Murti"
  | "Shiv Murti"
  | "Krishna Murti"
  | "Swami Smarath Murti"
  | "Decorative Spiritual Idols"
  | "Hanuman Murti"
  | "Shree Ram Murti";

export type Product = {
  id: string;
  slug: string;
  name: string;
  collection: ProductCollection;
  price: number;
  size: string;
  material: string;
  image: string;
  description: string;
  badge: string;
};

export type Review = {
  id?: string;
  productId?: string;
  name: string;
  city: string;
  rating: number;
  quote: string;
  createdAt?: string;
};
