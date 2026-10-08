"use client";

import { useEffect, useState } from "react";
import StarRating from "@/components/StarRating";

export default function BookReviews({ bookId }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/reviews/${bookId}`).then((response) => response.json()).then((data) => {
      if (active) { setReviews(data.reviews || []); setLoading(false); }
    }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [bookId]);
  const submit = async (event) => {
    event.preventDefault();
    setMessage(null);
    const response = await fetch(`/api/reviews/${bookId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating, review_text: text }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error || "Unable to save review.");
    setText(""); setRating(0); setMessage("Review saved.");
    const refreshed = await fetch(`/api/reviews/${bookId}`).then((result) => result.json());
    setReviews(refreshed.reviews || []);
  };
  return <section aria-labelledby="reviews-title" className="space-y-5">
    <h2 id="reviews-title" className="text-lg font-bold text-slate-900">Reviews</h2>
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <StarRating value={rating} onChange={setRating} label="Your rating" />
      <textarea required minLength={10} maxLength={2000} value={text} onChange={(event) => setText(event.target.value)} aria-label="Review text" placeholder="Share what you thought about this book" className="min-h-24 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm" />
      <button type="submit" disabled={!rating} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Post review</button>
      {message && <p role="status" className="text-sm text-slate-600">{message}</p>}
    </form>
    {loading ? <p className="text-sm text-slate-500">Loading reviews...</p> : reviews.length === 0 ? <p className="text-sm text-slate-500">No reviews yet.</p> : <div className="space-y-4">{reviews.map((review) => <article key={review.id} className="border-b border-slate-200 pb-4"><div className="flex items-center justify-between gap-3"><span className="font-semibold text-slate-800">{review.profiles?.full_name || "Student"}</span><StarRating value={review.rating} size="w-4 h-4" /></div><p className="mt-2 text-sm leading-6 text-slate-600">{review.review_text}</p>{review.is_verified_borrower && <span className="mt-2 inline-block text-xs font-semibold text-emerald-700">Verified borrower</span>}</article>)}</div>}
  </section>;
}
