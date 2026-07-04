export {
  collections,
  getProductById,
  getProductByLegacySlug,
  getProductBySlug,
  products
} from "./catalog";
export { deliveryEstimate } from "./delivery";
export {
  calculateLineTotal,
  calculateProductTotal,
  formatPrice,
  GIFT_BOX_PRICE
} from "./pricing";
export { productRating, ugcGallery } from "./reviews";
export { isLegacyUuidSlug, isValidProductId, isValidProductSlug, productPath } from "./slug";
export type { Product, ProductCollection, Review } from "./types";

export const whatsappUrl = "https://wa.me/917796675304";
export const instagramUrl = "https://instagram.com/shubharambh.murti";

import type { Product } from "./types";

export function orderMessage(product?: Product) {
  const text = product
    ? `Namaste, I want to order ${product.name} (${product.size}) from Shubharambh Murti Point.`
    : "Namaste, I want to order a murti from Shubharambh Murti Point.";

  return `${whatsappUrl}?text=${encodeURIComponent(text)}`;
}
