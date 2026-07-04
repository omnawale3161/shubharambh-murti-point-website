import { NextResponse } from "next/server";
import { ReviewsTableMissingError, createProductReview, validateReviewInput } from "@/lib/reviews";
import { getProductById } from "@/lib/products";
import { MissingSupabaseConfigurationError } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const input = validateReviewInput(await request.json());
    if (!input) {
      return NextResponse.json(
        { error: "Enter your name, city, 1-5 star rating, and a review of at least 10 characters." },
        { status: 400 }
      );
    }

    if (!getProductById(input.productId)) {
      return NextResponse.json({ error: "Product was not found." }, { status: 404 });
    }

    const review = await createProductReview(input);
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Review submission failed", error);
    if (error instanceof MissingSupabaseConfigurationError) {
      return NextResponse.json({ error: "Reviews need Supabase setup before customers can submit feedback." }, { status: 503 });
    }
    if (error instanceof ReviewsTableMissingError) {
      return NextResponse.json(
        { error: "Reviews database table is missing. Apply supabase/migrations/006_product_reviews.sql, then try again." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Review submission is temporarily unavailable." }, { status: 503 });
  }
}
