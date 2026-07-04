import "server-only";
import { SupabaseServerRequestError, supabaseServerRequest } from "@/lib/supabase/server";
import type { Review } from "@/lib/products";

type ReviewRow = {
  id: string;
  product_id: string;
  name: string;
  city: string;
  rating: number;
  quote: string;
  is_approved: boolean;
  created_at: string;
};

export type ReviewInput = {
  productId: string;
  name: string;
  city: string;
  rating: number;
  quote: string;
};

export class ReviewsTableMissingError extends Error {
  constructor() {
    super("The product_reviews table is missing. Apply supabase/migrations/006_product_reviews.sql.");
    this.name = "ReviewsTableMissingError";
  }
}

function toReview(row: ReviewRow): Review {
  return {
    id: row.id,
    productId: row.product_id,
    name: row.name,
    city: row.city,
    rating: row.rating,
    quote: row.quote,
    createdAt: row.created_at
  };
}

export function validateReviewInput(input: unknown): ReviewInput | null {
  if (!input || typeof input !== "object") return null;
  const data = input as Record<string, unknown>;
  const productId = String(data.productId || "").trim();
  const name = String(data.name || "").trim();
  const city = String(data.city || "").trim();
  const quote = String(data.quote || "").trim();
  const rating = Number(data.rating);

  if (!productId || name.length < 2 || name.length > 80) return null;
  if (city.length < 2 || city.length > 80) return null;
  if (quote.length < 10 || quote.length > 700) return null;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return null;

  return { productId, name, city, quote, rating };
}

export async function getApprovedProductReviews(productId: string) {
  try {
    const rows = await supabaseServerRequest<ReviewRow[]>(
      `product_reviews?product_id=eq.${encodeURIComponent(productId)}&is_approved=eq.true&select=id,product_id,name,city,rating,quote,is_approved,created_at&order=created_at.desc&limit=50`
    );
    return rows.map(toReview);
  } catch (error) {
    if (isMissingReviewsTableError(error)) return [];
    console.warn("Product reviews could not be loaded", error);
    return [];
  }
}

function isMissingReviewsTableError(error: unknown) {
  if (!(error instanceof SupabaseServerRequestError)) return false;
  const body = error.responseBody.toLowerCase();
  return error.status === 404 && (body.includes("product_reviews") || body.includes("pgrst205") || body.includes("could not find the table"));
}

export async function createProductReview(input: ReviewInput) {
  let rows: ReviewRow[];
  try {
    rows = await supabaseServerRequest<ReviewRow[]>("product_reviews", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        product_id: input.productId,
        name: input.name,
        city: input.city,
        rating: input.rating,
        quote: input.quote,
        is_approved: true
      })
    });
  } catch (error) {
    if (isMissingReviewsTableError(error)) throw new ReviewsTableMissingError();
    throw error;
  }

  if (!rows[0]) throw new Error("Review was not returned by Supabase.");

  return toReview(rows[0]);
}
