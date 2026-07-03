import { Product, Review } from "./types";

export const reviews: Review[] = [
  {
    name: "Priya Jadhav",
    city: "Pune",
    rating: 5,
    quote: "The finishing felt premium and the packing was very careful for our housewarming gift."
  },
  {
    name: "Sanket Patil",
    city: "Mumbai",
    rating: 5,
    quote: "Fast WhatsApp support, clear photos, and the murti looked exactly like the selected piece."
  },
  {
    name: "Meera Kulkarni",
    city: "Nashik",
    rating: 4,
    quote: "Beautiful idol for our home mandir. Gift box option made it easy to send to family."
  }
];

export const ugcGallery = [
  "/assets/shubharambh17.jpg",
  "/assets/bappa1.jpg",
  "/assets/hanuman1.png",
  "/assets/maharaj13.png"
];

export function productRating(product: Product) {
  const numericId = Number(product.id.replace(/\D/g, "")) || 1;

  return {
    rating: numericId % 4 === 1 ? 4.8 : 4.9,
    count: 18 + ((numericId - 1) % 9) * 7
  };
}
