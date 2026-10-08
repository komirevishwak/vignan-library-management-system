"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import { getBookCover, getBookFallbackCover } from "@/lib/utils";
import {
  Sparkles,
  BookOpen,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileText,
  BookmarkCheck,
  ArrowRight,
  BookMarked
} from "lucide-react";

export default function MyDigitalBooksPage() {
  const router = useRouter();
  const [borrows, setBorrows] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [confirmReturnModal, setConfirmReturnModal] = useState(null);
  const [notification, setNotification] = useState(null);

  const loadMyDigitalBorrows = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch active borrows
      const res = await fetch("/api/digital-borrowings/my-active");
      if (res.ok) {
        const data = await res.json();
        setBorrows(data.active_borrows || []);
      }

      // 2. Fetch history
      try {
        const histRes = await fetch("/api/digital-borrowings/history");
        if (histRes.ok) {
          const histData = await histRes.json();
          setHistory(histData.history || []);
        }
      } catch (hErr) {
        console.warn("History fetch notice:", hErr);
      }
    } catch (err) {
      console.error("Error loading my digital books:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyDigitalBorrows();
  }, [loadMyDigitalBorrows]);

  const handleReturn = async (borrowing) => {
    try {
      setReturningId(borrowing.id);
      const res = await fetch(`/api/digital-borrowings/${borrowing.id}/return`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setNotification({
          type: "error",
          message: data.error || "Failed to return digital book.",
        });
        return;
      }

      setNotification({
        type: "success",
        message: `"${borrowing.book?.title || 'Book'}" has been returned. One borrowing slot is now available.`,
      });

      setConfirmReturnModal(null);
      loadMyDigitalBorrows();
    } catch (err) {
      console.error("Return error:", err);
      setNotification({
        type: "error",
        message: "An error occurred while ending access.",
      });
    } finally {
      setReturningId(null);
    }
  };

  const activeCount = borrows.length;

  return (
    <div className="space-y-8">
      {/* Header & Capacity Meter */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-xs font-bold text-brand-700 border border-brand-100">
            <BookmarkCheck className="w-3.5 h-3.5" />
            Active e-Book Shelf
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Digital Books
          </h1>
          <p className="text-slate-500 text-sm">
            Manage your active 14-day digital book loans and launch the in-browser reader.
          </p>
        </div>

        {/* Capacity Indicator Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 min-w-[260px] flex flex-col justify-center">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            <span>Loan Capacity</span>
            <span className={activeCount === 2 ? "text-amber-600" : "text-emerald-600"}>
              {activeCount} of 2 Used
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                activeCount === 2
                  ? "bg-amber-500 w-full"
                  : activeCount === 1
                  ? "bg-emerald-500 w-1/2"
                  : "w-0"
              }`}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
            <span>{2 - activeCount} slot(s) available</span>
            <Link
              href="/student/digital-books"
              className="font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              Browse e-Books <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border shadow-md flex items-center justify-between gap-4 animate-in fade-in ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Active Borrowings Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-600" />
            Active Loans ({borrows.length})
          </h2>
          {borrows.length < 2 && (
            <Link
              href="/student/digital-books"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition"
            >
              + Borrow Another e-Book
            </Link>
          )}
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-200">
            <div className="w-8 h-8 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
            <p className="text-sm text-slate-500">Checking your digital book shelf...</p>
          </div>
        ) : borrows.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
            <EmptyState
              title="You don't have any active digital books"
              description="Explore our digital library to borrow textbooks for 14-day online reading access. You can borrow up to 2 books concurrently."
              actionText="Browse Digital Library"
              onAction={() => router.push("/student/digital-books")}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {borrows.map((borrowing) => {
              const book = borrowing.book || {};
              const daysRemaining = borrowing.days_remaining ?? 14;
              const isUrgent = daysRemaining <= 2;
              const percentUsed = borrowing.percent_used || 0;

              return (
                <div
                  key={borrowing.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative overflow-hidden"
                >
                  {/* Top Header Card */}
                  <div className="flex gap-4">
                    {/* Cover Thumbnail */}
                    <div className="w-24 h-32 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-200/80 shadow-sm relative">
                      {getBookCover(book, "M") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getBookCover(book, "M")}
                          alt={`Cover of ${book.title} by ${book.author}`}
                          onError={(event) => {
                            event.currentTarget.src = getBookFallbackCover(book);
                          }}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-brand-900 text-white p-2 text-center">
                          <BookOpen className="w-6 h-6 opacity-60" />
                          <span className="text-[10px] font-bold mt-1 line-clamp-2">
                            {book.title}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Book Info */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                        {book.category || "Computer Science"}
                      </span>
                      <h3
                        className="font-bold text-slate-900 text-base leading-snug line-clamp-2"
                        title={book.title}
                      >
                        {book.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        By {book.author}
                      </p>

                      {/* Due Countdown Pill */}
                      <div className="pt-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold ${
                            isUrgent
                              ? "bg-rose-100 text-rose-700 border border-rose-200 animate-pulse"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {daysRemaining === 0
                            ? "Expires Today!"
                            : daysRemaining === 1
                            ? "Due in 1 day"
                            : `Due in ${daysRemaining} days`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 14-Day Timeline Bar */}
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span>Loan Timeline</span>
                      <span>{percentUsed}% of 14 days used</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          percentUsed > 85
                            ? "bg-rose-500"
                            : percentUsed > 60
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-3">
                    <Link
                      href={`/student/reader/${borrowing.id}`}
                      className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-brand-600/20 active:scale-98 transition"
                    >
                      <BookOpen className="w-4 h-4" />
                      Read Online
                    </Link>

                    <button
                      onClick={() => setConfirmReturnModal(borrowing)}
                      className="py-3 px-3.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-1.5"
                      title="End reading early and release borrowing slot"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">End Reading</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Past Digital Book Loans ({history.length})
          </h2>
          <div className="divide-y divide-slate-100">
            {history.slice(0, 5).map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">
                    {item.book?.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {item.book?.author} • Returned on {new Date(item.returned_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                    item.status === "returned"
                      ? "bg-slate-100 text-slate-700"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Return Dialog Modal */}
      {confirmReturnModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900">End Digital Loan Early?</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Return <strong>&quot;{confirmReturnModal.book?.title}&quot;</strong>?
              Your access will end and free up 1 of your 2 borrowing slots.
              You can re-borrow this title anytime.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => setConfirmReturnModal(null)}
                disabled={!!returningId}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Keep Reading
              </button>
              <button
                onClick={() => handleReturn(confirmReturnModal)}
                disabled={!!returningId}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5"
              >
                {returningId ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  "Confirm Return"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
