export type ProductBadge = "Best Seller" | "New Arrival" | "Premium" | "Limited";

export interface BaseExcelProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  badge?: ProductBadge;
  description: string;
  image: string;
  inStock: boolean;
  stockCount: number;
  occasion: string[];
}

export interface Idol extends BaseExcelProduct {
  collection: string;
  size: string;
  material: string;
  weight?: string;
}

export interface Frame extends BaseExcelProduct {
  frameType: string;
  dimensions: string;
  material: string;
  photoSlots: number;
}

export interface DecorItem extends BaseExcelProduct {
  category: string;
  dimensions?: string;
  material: string;
}
