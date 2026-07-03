"use client";

import { FormEvent, useState } from "react";
import { Review, whatsappUrl } from "@/lib/products";

export function ReviewsPanel({ initialReviews }: { initialReviews: Review[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReviews((items) => [{ name, city, quote, rating }, ...items]);
    setName("");
    setCity("");
    setQuote("");
    setRating(5);
    setSubmitted(true);
  }

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="grid gap-5 md:grid-cols-2">
        {reviews.map((review, index) => (
          <blockquote key={`${review.name}-${review.city}-${index}`} className="premium-card rounded-2xl p-6">
            <p className="text-sm font-black text-gold">{"★".repeat(review.rating)}</p>
            <p className="mt-4 text-lg font-bold leading-8 text-ink/78">“{review.quote}”</p>
            <footer className="mt-5 text-sm font-black text-maroon">{review.name}, {review.city}</footer>
          </blockquote>
        ))}
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
            <textarea required name="review" value={quote} onChange={(event) => setQuote(event.target.value)} rows={4} className="resize-none rounded-xl border border-gold/25 bg-white px-4 py-3 font-semibold" />
          </label>
          <button type="submit" className="btn btn-primary">Submit Review</button>
          {submitted ? <p className="text-sm font-bold text-maroon" role="status">Thank you. Your review is now shown above.</p> : null}
          <a href={`${whatsappUrl}?text=${encodeURIComponent("Namaste, I would like to share my product photo for your customer gallery.")}`} className="btn btn-secondary text-sm">
            Share UGC Photo
          </a>
        </div>
      </form>
    </div>
  );
}
