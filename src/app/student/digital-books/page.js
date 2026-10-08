"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DIGITAL_CATEGORIES, DIGITAL_BOOKS_SEED } from "@/lib/digital-books-data";
import { getBookCover, getBookFallbackCover } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";
import {
  Sparkles,
  Search,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
  BookmarkCheck,
  Layers,
  FileText,
  Info
} from "lucide-react";

export default function DigitalBooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBorrows, setActiveBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [borrowingId, setBorrowingId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [errorModal, setErrorModal] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  // Load digital books and current active loans
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch Digital Books from API
      let catalog = [];
      try {
        const res = await fetch("/api/digital-books");
        if (res.ok) {
          const data = await res.json();
          catalog = data.books || [];
        }
      } catch (apiErr) {
        console.warn("API digital books fetch notice:", apiErr);
      }

      if (!catalog || catalog.length === 0) {
        catalog = DIGITAL_BOOKS_SEED;
      }

      setBooks(catalog);
      setFilteredBooks(catalog);

      // 2. Fetch student's current active digital borrows
      try {
        const activeRes = await fetch("/api/digital-borrowings/my-active");
        if (activeRes.ok) {
          const activeData = await activeRes.json();
          setActiveBorrows(activeData.active_borrows || []);
        }
      } catch (activeErr) {
        console.warn("Active borrows fetch notice:", activeErr);
      }
    } catch (err) {
      console.error("Error loading digital library:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtering & Search Effect
  useEffect(() => {
    let result = [...books];

    if (selectedCategory !== "All") {
      result = result.filter((b) => b.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          (b.category && b.category.toLowerCase().includes(q)) ||
          (b.isbn && b.isbn.toLowerCase().includes(q))
      );
    }

    setFilteredBooks(result);
  }, [books, selectedCategory, searchQuery]);

  // Check if a book is already borrowed by the student
  const isBookBorrowed = (bookId, isbn) => {
    return activeBorrows.some(
      (b) => b.digital_book_id === bookId || (b.book?.isbn && b.book.isbn === isbn)
    );
  };

  const parseBorrowErrorMessage = (status, data) => {
    const message = data?.error || "Unable to add the book right now. Please try again.";

    if (status === 401 || /log in|sign in/i.test(message)) {
      return "Please log in to add books.";
    }

    if (status === 409 || /already.*My Digital Books|already have an active/i.test(message)) {
      return "This book is already in My Digital Books.";
    }

    if (status === 400 || /maximum of 2|2 active digital books|up to 2/i.test(message)) {
      return "You can have a maximum of 2 active digital books.";
    }

    return "Unable to add the book right now. Please try again.";
  };

  // Handle Borrowing Action
  const handleBorrow = async (book) => {
    const alreadyBorrowed = isBookBorrowed(book.id, book.isbn);

    if (alreadyBorrowed) {
      setNotification({
        type: "info",
        message: "This book is already in My Digital Books.",
      });
      return;
    }

    if (activeBorrows.length >= 2) {
      setNotification({
        type: "info",
        message: "You can have a maximum of 2 active digital books.",
      });
      return;
    }

    try {
      setBorrowingId(book.id);
      const res = await fetch("/api/digital-borrowings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ digital_book_id: book.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        const friendlyMessage = parseBorrowErrorMessage(res.status, data);
        if (res.status === 400 || res.status === 409 || res.status === 401) {
          setNotification({ type: "info", message: friendlyMessage });
        } else {
          setNotification({ type: "error", message: friendlyMessage });
        }
        return;
      }

      setNotification({
        type: "success",
        title: "Book added to My Digital Books.",
        message: `"${book.title}" has been added to your active shelf.`,
        actionUrl: "/student/my-digital-books",
        actionText: "View My Digital Books",
      });

      setSelectedBook(null);
      await loadData();
    } catch (err) {
      console.error("Borrow error:", err);
      setNotification({
        type: "error",
        message: "Unable to add the book right now. Please try again.",
      });
    } finally {
      setBorrowingId(null);
    }
  };

  const activeCount = activeBorrows.length;

  return (
    <div className="space-y-6">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-emerald-300 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              e-Book Access Program
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              Digital Books Library
            </h1>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              Borrow official e-textbooks for <strong>14 days of instant online reading</strong>.
              Read anytime in your browser with our integrated reader.
            </p>
          </div>

          {/* Limit Badge Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center shrink-0 min-w-[200px]">
            <span className="text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
              Active e-Book Loans
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className={`text-3xl font-black ${
                activeCount === 2 ? "text-amber-300" : activeCount === 1 ? "text-emerald-300" : "text-white"
              }`}>
                {activeCount}
              </span>
              <span className="text-slate-300 font-bold text-lg">/ 2 max</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2 my-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  activeCount === 2 ? "bg-amber-400 w-full" : activeCount === 1 ? "bg-emerald-400 w-1/2" : "w-0"
                }`}
              />
            </div>
            <Link
              href="/student/my-digital-books"
              className="mt-1 text-xs text-white underline hover:text-emerald-200 font-semibold inline-flex items-center gap-1"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              View My e-Books ({activeCount})
            </Link>
          </div>
        </div>
      </div>

      {/* Notifications Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border shadow-lg flex items-start justify-between gap-4 animate-in fade-in slide-in-from-top-2 ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : notification.type === "info"
              ? "bg-blue-50 border-blue-200 text-blue-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-start gap-3">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : notification.type === "info" ? (
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              {notification.title && <p className="font-bold text-sm">{notification.title}</p>}
              <p className="text-xs sm:text-sm mt-0.5">{notification.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {notification.actionUrl && (
              <Link
                href={notification.actionUrl}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                {notification.actionText || "View"}
              </Link>
            )}
            <button
              onClick={() => setNotification(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search digital books by title, author, or ISBN..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Domain:
          </span>
          {DIGITAL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-brand-600 text-white shadow-sm shadow-brand-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Results Grid */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500">Loading digital books collection...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <EmptyState
          title="No digital books match your search"
          description="Try selecting a different domain category or searching with another keyword."
          actionText="Clear Filters"
          onAction={() => {
            setSelectedCategory("All");
            setSearchQuery("");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => {
            const alreadyHeld = isBookBorrowed(book.id, book.isbn);
            const isAtLimit = activeCount >= 2 && !alreadyHeld;
            const isSubmitting = borrowingId === book.id;

            return (
              <div
                key={book.id}
                onClick={() => setSelectedBook(book)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedBook(book);
                  }
                }}
                role="button"
                tabIndex={0}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group cursor-pointer"
              >
                {/* Book Cover Image */}
                <div className="h-52 bg-slate-100 relative overflow-hidden shrink-0">
                  {getBookCover(book, "M") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getBookCover(book, "M")}
                      alt={`Cover of ${book.title} by ${book.author}`}
                      onError={(event) => {
                        event.currentTarget.src = getBookFallbackCover(book);
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-brand-900 to-brand-700 text-white p-4 text-center">
                      <BookOpen className="w-10 h-10 mb-2 opacity-60" />
                      <p className="font-bold text-xs line-clamp-2">{book.title}</p>
                    </div>
                  )}

                  {/* 14 Days Loan Badge */}
                  <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    14 Days
                  </div>

                  {/* Category Pill */}
                  <div className="absolute bottom-2.5 left-2.5 bg-brand-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                    {book.category}
                  </div>
                </div>

                {/* Book Metadata */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3
                      className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors"
                      title={book.title}
                    >
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium line-clamp-1">
                      {book.author}
                    </p>
                    {book.description && (
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                        {book.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom Action Area */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {book.isbn || "Digital Edition"}
                    </span>

                    {alreadyHeld ? (
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl cursor-not-allowed"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Already Added
                      </button>
                    ) : (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleBorrow(book);
                        }}
                        disabled={isSubmitting || isAtLimit}
                        className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95 ${
                          isAtLimit
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                            : "bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/20"
                        }`}
                        title={isAtLimit ? "2-book loan limit reached" : "Add this book to My Digital Books"}
                      >
                        {isSubmitting ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        {isAtLimit ? "Limit (2/2)" : "Add Book"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-2xl w-full shadow-2xl border border-slate-200">
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="w-full sm:w-44 shrink-0">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  {getBookCover(selectedBook, "L") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getBookCover(selectedBook, "L")}
                      alt={`Cover of ${selectedBook.title} by ${selectedBook.author}`}
                      onError={(event) => {
                        event.currentTarget.src = getBookFallbackCover(selectedBook);
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-700 text-white p-4 text-center">
                      <BookOpen className="w-10 h-10 opacity-70" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-600">
                      {selectedBook.category || "General"}
                    </p>
                    <h3 className="text-xl font-black text-slate-900 mt-2 leading-tight">{selectedBook.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">by {selectedBook.author}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBook(null)}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    aria-label="Close book details"
                  >
                    ✕
                  </button>
                </div>

                {selectedBook.description && (
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedBook.description}</p>
                )}

                <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                  {selectedBook.isbn && <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">ISBN: {selectedBook.isbn}</span>}
                  {selectedBook.file_size_mb && <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">{selectedBook.file_size_mb} MB</span>}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleBorrow(selectedBook)}
                    disabled={borrowingId === selectedBook.id || isBookBorrowed(selectedBook.id, selectedBook.isbn) || activeBorrows.length >= 2}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition ${
                      isBookBorrowed(selectedBook.id, selectedBook.isbn)
                        ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
                        : activeBorrows.length >= 2 && !isBookBorrowed(selectedBook.id, selectedBook.isbn)
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-brand-600 text-white hover:bg-brand-700"
                    }`}
                  >
                    {borrowingId === selectedBook.id
                      ? "Adding..."
                      : isBookBorrowed(selectedBook.id, selectedBook.isbn)
                      ? "Already Added"
                      : activeBorrows.length >= 2
                      ? "Limit reached"
                      : "Add Book"}
                  </button>

                  {(selectedBook.file_url || selectedBook.external_link) && (
                    <a
                      href={selectedBook.file_url || selectedBook.external_link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-3 px-4 rounded-xl text-sm font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 text-center transition"
                    >
                      Read Now
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Limit Modal */}
      {errorModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900">{errorModal.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{errorModal.message}</p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => setErrorModal(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Close
              </button>
              <Link
                href={errorModal.actionUrl}
                onClick={() => setErrorModal(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 transition shadow-md shadow-brand-600/20"
              >
                {errorModal.actionText}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
