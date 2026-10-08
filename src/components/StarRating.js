"use client";

import { Star } from "lucide-react";

export default function StarRating({ value = 0, onChange, size = "w-5 h-5", label = "Rating" }) {
  const interactive = typeof onChange === "function";
  return (
    <div className="inline-flex items-center" role={interactive ? "radiogroup" : "img"} aria-label={`${label}: ${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;
        return interactive ? (
          <button key={star} type="button" role="radio" aria-checked={value === star} aria-label={`${star} star${star === 1 ? "" : "s"}`} onClick={() => onChange(star)} className="rounded p-0.5 text-amber-500 focus:outline-none focus:ring-2 focus:ring-brand-500">
            <Star className={`${size} ${active ? "fill-current" : "fill-transparent text-slate-300"}`} />
          </button>
        ) : <Star key={star} aria-hidden="true" className={`${size} ${active ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-300"}`} />;
      })}
    </div>
  );
}
