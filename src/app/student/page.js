"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES } from "@/lib/utils";
import DigitalBookCard from "@/components/DigitalBookCard";
import EmptyState from "@/components/EmptyState";
import { Search, BookOpen } from "lucide-react";

export default function DigitalLibraryPage() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadDigitalBooks = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("digital_books")
        .select("*")
        .order("title", { ascending: true });

      if (error) {
        console.error("Error loading digital library:", error);
        setLoadError(true);
        setBooks([]);
        setFilteredBooks([]);
      } else {
        setBooks(data || []);
        setFilteredBooks(data || []);
      }
    } catch (err) {
      console.error("Error loading digital library:", err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDigitalBooks();
  }, [loadDigitalBooks]);

  useEffect(() => {
    let result = [...books];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter((b) => b.category === selectedCategory);
    }

    setFilteredBooks(result);
  }, [searchQuery, selectedCategory, books]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Digital Library
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Free, open-license e-books you can read instantly, plus links to find copyrighted
          titles through legitimate sources.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, or category..."
              className="block w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

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
        </div>

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

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-4 h-80 animate-pulse flex flex-col justify-between"
            >
              <div className="bg-slate-200 h-44 rounded-xl mb-3" />
              <div className="space-y-2">
                <div className="bg-slate-200 h-4 rounded w-3/4" />
                <div className="bg-slate-200 h-3 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : loadError ? (
        <EmptyState
          icon={BookOpen}
          title="Couldn't load the digital library"
          description="Something went wrong fetching digital books. Please refresh or try again shortly."
          actionLabel="Retry"
          onAction={loadDigitalBooks}
        />
      ) : filteredBooks.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Digital Books Found"
          description={`We couldn't find any digital titles matching "${
            searchQuery || selectedCategory
          }". Try another search or reset filters.`}
          actionLabel="Reset Search Filters"
          onAction={() => {
            setSearchQuery("");
            setSelectedCategory("All");
          }}
        />
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing {filteredBooks.length} digital titles</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <DigitalBookCard key={book.id} book={book} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
