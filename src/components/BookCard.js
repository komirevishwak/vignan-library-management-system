import { Book, CheckCircle2, XCircle, Tag, Hash } from "lucide-react";
import { useState } from "react";
import { getBookCover } from "@/lib/utils";

export default function BookCard({ book, onSelect, actionLabel = "View Details" }) {
  const isAvailable = (book.available_copies || 0) > 0;
  const [imgError, setImgError] = useState(false);
  const coverSrc = getBookCover(book, "M");

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col">
      {/* Book Cover Area */}
      <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 overflow-hidden flex items-center justify-center">
        {coverSrc && !imgError ? (
          <img
            src={coverSrc}
            alt={book.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-5 text-center bg-gradient-to-br from-slate-900 via-brand-950 to-emerald-950 text-white relative">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3 backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform">
              <Book className="w-6 h-6 text-brand-300" />
            </div>
            <span className="text-xs font-bold leading-snug line-clamp-3 text-slate-100">{book.title}</span>
            <span className="text-[11px] text-slate-400 mt-1 font-medium">{book.author}</span>
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white shadow border border-white/10">
            <Tag className="w-3 h-3 text-brand-400" />
            {book.category || "General"}
          </span>
        </div>

        {/* Availability Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full shadow backdrop-blur-md ${
              isAvailable
                ? "bg-emerald-500/90 text-white border border-emerald-400/30"
                : "bg-rose-500/90 text-white border border-rose-400/30"
            }`}
          >
            {isAvailable ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                {book.available_copies} Available
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3" />
                Checked Out
              </>
            )}
          </span>
        </div>
      </div>

      {/* Book Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
            {book.title}
          </h4>
          <p className="text-xs font-medium text-slate-500 mt-1">by {book.author}</p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2 font-mono">
            <Hash className="w-3 h-3" />
            <span>ISBN: {book.isbn}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Total: <span className="font-semibold text-slate-700">{book.total_copies} copies</span>
          </div>
          {onSelect && (
            <button
              onClick={() => onSelect(book)}
              className="text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
