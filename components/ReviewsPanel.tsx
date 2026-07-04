"use client";

import { FormEvent, useState } from "react";
import { Review } from "@/lib/products";

async function responseJson(response: Response) {
  const body = await response.json() as { review?: Review; error?: string };
  if (!response.ok || !body.review) throw new Error(body.error || "Review could not be submitted.");
  return body.review;
}

export function ReviewsPanel({ initialReviews, productId }: { initialReviews: Review[]; productId: string }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (name.trim().length < 2 || city.trim().length < 2 || quote.trim().length < 10) {
      setStatus({ kind: "error", message: "Please enter your name, city, and a review of at least 10 characters." });
      return;
    }

    setIsSubmitting(true);
    try {
      const review = await responseJson(await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, name, city, quote, rating })
      }));
      setReviews((items) => [review, ...items]);
      setName("");
      setCity("");
      setQuote("");
      setRating(5);
      setStatus({ kind: "success", message: "Thank you. Your review has been submitted successfully." });
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Review submission failed." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="grid gap-5 md:grid-cols-2">
        {reviews.length ? reviews.map((review, index) => (
          <blockquote key={review.id || `${review.name}-${review.city}-${index}`} className="premium-card rounded-2xl p-6">
            <p className="text-sm font-black text-gold">{"★".repeat(review.rating)}</p>
            <p className="mt-4 text-lg font-bold leading-8 text-ink/78">“{review.quote}”</p>
            <footer className="mt-5 text-sm font-black text-maroon">{review.name}, {review.city}</footer>
          </blockquote>
        )) : (
          <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-card md:col-span-2">
            <p className="font-black text-primary">No customer reviews yet.</p>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">Be the first verified customer to share your experience with this murti.</p>
          </div>
        )}
      </div>

      <form onSubmit={submitReview} className="h-fit rounded-2xl border border-gold/20 bg-beige p-5">
        <h3 className="text-xl font-black">Share your experience</h3>
        <div className="mt-5 grid gap-3">
          <label className="grid gap-2 text-sm font-black">Rating
            <select name="rating" value={rating} onChange={(event) => setRating(Number(event.target.value))} className="rounded-xl border border-gold/25 bg-white px-4 py-3 font-bold">
              {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-black">Your name
            <input required name="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="rounded-xl border border-gold/25 bg-white px-4 py-3 font-semibold" />
          </label>
          <label className="grid gap-2 text-sm font-black">City
            <input required name="city" autoComplete="address-level2" value={city} onChange={(event) => setCity(event.target.value)} className="rounded-xl border border-gold/25 bg-white px-4 py-3 font-semibold" />
          </label>
          <label className="grid gap-2 text-sm font-black">Review
            <textarea required name="review" minLength={10} maxLength={700} value={quote} onChange={(event) => setQuote(event.target.value)} rows={4} className="resize-none rounded-xl border border-gold/25 bg-white px-4 py-3 font-semibold" />
          </label>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary disabled:opacity-50">{isSubmitting ? "Submitting..." : "Submit Review"}</button>
          {status ? <p className={`text-sm font-bold ${status.kind === "error" ? "text-error" : "text-maroon"}`} role={status.kind === "error" ? "alert" : "status"}>{status.message}</p> : null}
        </div>
      </form>
    </div>
  );
}
