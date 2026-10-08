"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, COLLEGE_LIBRARY_BOOKS, getBookCover } from "@/lib/utils";
import BookCard from "@/components/BookCard";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";
import {
  Search,
  Filter,
  BookOpen,
  CheckCircle2,
  XCircle,
  Hash,
  Tag,
  Layers,
  GraduationCap,
  Sparkles,
  Radio
} from "lucide-react";

export default function StudentCatalogPage() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);

  const loadCatalog = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("title", { ascending: true });

      if (error || !data || data.length === 0) {
        setBooks(COLLEGE_LIBRARY_BOOKS);
        setFilteredBooks(COLLEGE_LIBRARY_BOOKS);
      } else {
        setBooks(data);
        setFilteredBooks(data);
      }
    } catch (err) {
      console.error("Error loading catalog:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();

    // Setup Supabase Realtime subscription for instant stock / available copies updates
    const supabase = createClient();
    const channel = supabase
      .channel("student_catalog_books_live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "books" },
        (payload) => {
          console.log("Real-time books update received:", payload);
          loadCatalog();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadCatalog]);


  // Filter effect
  useEffect(() => {
    let result = [...books];

    // Filter search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q)
      );
    }

    // Filter category
    if (selectedCategory !== "All") {
      result = result.filter((b) => b.category === selectedCategory);
    }

    // Filter availability
    if (availableOnly) {
      result = result.filter((b) => (b.available_copies || 0) > 0);
    }

    setFilteredBooks(result);
  }, [searchQuery, selectedCategory, availableOnly, books]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Library Book Catalog
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore textbooks, reference volumes, journals, and monographs available across academic disciplines.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by book title, author, category, or ISBN..."
              className="block w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="sm:w-60">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Available Only Toggle */}
          <div className="flex items-center">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-slate-100 transition">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-700">Available Only</span>
            </label>
          </div>
        </div>

        {/* Quick Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap">Filter:</span>
          {["All", ...CATEGORIES.slice(0, 6)].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                selectedCategory === cat
                  ? "bg-brand-600 text-white shadow-sm"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 h-80 animate-pulse flex flex-col justify-between">
              <div className="bg-slate-200 h-44 rounded-xl mb-3" />
              <div className="space-y-2">
                <div className="bg-slate-200 h-4 rounded w-3/4" />
                <div className="bg-slate-200 h-3 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Books Found"
          description={`We couldn't find any books matching "${searchQuery || selectedCategory}". Try searching for another topic or resetting filters.`}
          actionLabel="Reset Search Filters"
          onAction={() => {
            setSearchQuery("");
            setSelectedCategory("All");
            setAvailableOnly(false);
          }}
        />
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing {filteredBooks.length} titles</span>
            <span>Standard loan: 14 days</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                actionLabel="Details & Borrow"
                onSelect={(b) => setSelectedBook(b)}
              />
            ))}
          </div>
        </>
      )}

      {/* Book Details Modal */}
      <Modal
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        title="Book Information & Live Availability"
      >
        {selectedBook && (
          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="w-24 h-32 rounded-xl bg-slate-900 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                {getBookCover(selectedBook, "L") ? (
                  <img
                    src={getBookCover(selectedBook, "L")}
                    alt={selectedBook.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 mb-2">
                  <Tag className="w-3 h-3" />
                  {selectedBook.category}
                </span>
                <h4 className="font-bold text-base text-slate-900 leading-snug">
                  {selectedBook.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1">Author: {selectedBook.author}</p>
                <p className="text-xs text-slate-400 font-mono mt-1">ISBN: {selectedBook.isbn}</p>
              </div>
            </div>

            {/* Availability Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Circulation Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {selectedBook.available_copies > 0 ? (
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" /> Available for checkout
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-rose-600">
                      <XCircle className="w-4 h-4" /> All copies currently issued
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Available / Total</p>
                <p className="text-base font-extrabold text-slate-900">
                  {selectedBook.available_copies} / {selectedBook.total_copies}
                </p>
              </div>
            </div>

            {/* How to Borrow Instructions */}
            <div className="p-4 rounded-xl bg-brand-50/70 border border-brand-200 text-xs text-brand-900 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-brand-600" />
                How to Borrow this Title:
              </p>
              <p className="text-brand-800">
                1. Visit the central library circulation desk on Ground Floor.
              </p>
              <p className="text-brand-800">
                2. Show your Student Roll Number and mention ISBN <code className="font-mono font-bold">{selectedBook.isbn}</code>.
              </p>
              <p className="text-brand-800">
                3. The librarian will issue the book to your account for 14 days.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedBook(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
