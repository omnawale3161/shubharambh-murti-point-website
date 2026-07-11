export type ProductCollection = string;

export type Product = {
  id: string;
  slug: string;
  name: string;
  collection: ProductCollection;
  price: number;
  size: string;
  material: string;
  image: string;
  images?: string[];
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
