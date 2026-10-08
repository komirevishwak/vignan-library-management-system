"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { calculateFine, formatCurrency, formatDate } from "@/lib/utils";
import StatCard from "@/components/StatCard";
import BorrowTable from "@/components/BorrowTable";
import EmptyState from "@/components/EmptyState";
import {
  BookOpen,
  Clock,
  AlertTriangle,
  Receipt,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles,
  BookmarkCheck,
  ArrowRight,
  MessageSquare
} from "lucide-react";

export default function StudentDashboardPage() {
  const [activeLoans, setActiveLoans] = useState([]);
  const [digitalLoans, setDigitalLoans] = useState([]);
  const [catalogBooks, setCatalogBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [suggestion, setSuggestion] = useState({ category: "General Feedback", description: "" });
  const [suggestionStatus, setSuggestionStatus] = useState(null);
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      // Student activity powers the admin dashboard's configurable recent-session count.
      if (authUser) {
        await supabase.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", authUser.id);
      }

      // Fetch digital loans
      try {
        const digRes = await fetch("/api/digital-borrowings/my-active");
        if (digRes.ok) {
          const digData = await digRes.json();
          setDigitalLoans(digData.active_borrows || []);
        }
      } catch (dErr) {
        console.warn("Digital loans dashboard fetch notice:", dErr);
      }

      if (!authUser) {
        setActiveLoans([]);
        setCatalogBooks([]);
        setLoading(false);
        return;
      }

      const { data: catalog } = await supabase
        .from("books")
        .select("id, title, category")
        .order("title", { ascending: true })
        .limit(6);
      setCatalogBooks(catalog || []);

      // Fetch active loans for logged-in student
      const { data: loans, error: loansError } = await supabase
        .from("borrow_records")
        .select(`
          *,
          books (
            title,
            author,
            isbn,
            cover_url,
            category
          )
        `)
        .eq("student_id", authUser.id)
        .neq("status", "returned")
        .order("due_date", { ascending: true });

      if (loansError) {
        console.error("Error fetching loans:", loansError);
      } else {
        setActiveLoans(loans || []);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSuggestionSubmit = async (event) => {
    event.preventDefault();
    if (!suggestion.description.trim()) return;

    setSubmittingSuggestion(true);
    setSuggestionStatus(null);
    try {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("Please sign in again before sending feedback.");

      const { error: insertError } = await supabase.from("suggestions").insert({
        student_id: authUser.id,
        category: suggestion.category,
        description: suggestion.description.trim(),
        status: "Open",
      });

      if (insertError) throw insertError;
      setSuggestion({ category: "General Feedback", description: "" });
      setSuggestionStatus({ type: "success", text: "Thanks. Your suggestion was sent to the library help desk." });
    } catch (err) {
      setSuggestionStatus({ type: "error", text: err.message || "Unable to send your suggestion." });
    } finally {
      setSubmittingSuggestion(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Setup Supabase Realtime subscription for instant updates on loans
    const supabase = createClient();
    const channel = supabase
      .channel("student_borrow_records_live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "borrow_records" },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDashboardData]);

  // Compute live metrics
  let totalPendingFine = 0;
  let overdueCount = 0;
  let earliestDueDate = null;

  activeLoans.forEach((loan) => {
    const fineInfo = calculateFine(loan.due_date, loan.return_date);
    if (fineInfo.isOverdue) {
      overdueCount++;
      if (!loan.fine_paid) {
        totalPendingFine += fineInfo.fine;
      }
    } else if (loan.fine_amount > 0 && !loan.fine_paid) {
      totalPendingFine += Number(loan.fine_amount);
    }

    if (loan.due_date) {
      const d = new Date(loan.due_date);
      if (!earliestDueDate || d < earliestDueDate) {
        earliestDueDate = d;
      }
    }
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Overdue Warning Alert - Only shown if action is urgently needed */}
      {overdueCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-rose-900">
                {overdueCount} {overdueCount === 1 ? "Book is Overdue!" : "Books are Overdue!"}
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Fine accumulates automatically at ₹5/day until returned to the library desk.
              </p>
            </div>
          </div>
          <div className="font-bold text-sm text-rose-900 bg-white px-3.5 py-1.5 rounded-xl border border-rose-300 self-start sm:self-auto">
            Fine Owed: {formatCurrency(totalPendingFine)}
          </div>
        </div>
      )}

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Physical Books Currently Borrowed */}
        <StatCard
          title="Physical Books"
          value={loading ? "..." : `${activeLoans.length} / 3`}
          subtitle={activeLoans.length > 0 ? "Standard quota: 3 books" : "No active loans"}
          icon={BookOpen}
          color="blue"
        />

        {/* Metric 2: Digital Books Borrowed */}
        <StatCard
          title="Digital e-Books"
          value={loading ? "..." : `${digitalLoans.length} / 2`}
          subtitle={digitalLoans.length > 0 ? "14-day online reading access" : "2 loan slots open"}
          icon={Sparkles}
          color={digitalLoans.length === 2 ? "amber" : "emerald"}
        />

        {/* Metric 3: Next Return Due Date */}
        <StatCard
          title="Next Due Date"
          value={
            loading
              ? "..."
              : activeLoans.length === 0
              ? "None"
              : earliestDueDate
              ? formatDate(earliestDueDate.toISOString())
              : "N/A"
          }
          subtitle={
            overdueCount > 0
              ? `${overdueCount} book(s) past deadline`
              : activeLoans.length > 0
              ? "Return before deadline"
              : "All clear"
          }
          icon={Calendar}
          color={overdueCount > 0 ? "rose" : "blue"}
          alert={overdueCount > 0}
        />

        {/* Metric 4: Total Fine Owed (Auto-Calculated) */}
        <StatCard
          title="Fine Owed"
          value={loading ? "..." : formatCurrency(totalPendingFine)}
          subtitle={totalPendingFine > 0 ? "Calculated at ₹5/day" : "Zero penalty balance"}
          icon={Receipt}
          color={totalPendingFine > 0 ? "amber" : "emerald"}
          alert={totalPendingFine > 0}
        />
      </div>

      {/* Digital library preview is the first student destination after sign-in. */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Digital Books / E-Books</h2>
            <p className="text-xs text-slate-500 mt-0.5">Browse the digital library collection and add titles to your shelf.</p>
          </div>
          <Link
            href="/student/digital-books"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
          >
            Open digital library <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {catalogBooks.map((book) => (
            <div key={book.id} className="border border-slate-200 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-600">{book.category}</p>
              <h3 className="font-semibold text-sm text-slate-900 mt-1 line-clamp-2">{book.title}</h3>
              <p className="text-xs font-semibold text-emerald-600 mt-3">Available to read</p>
            </div>
          ))}
        </div>
      </section>

      {/* Student feedback feeds the shared admin help desk. */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Suggestions & Help Desk</h2>
            <p className="text-xs text-slate-500 mt-1">Report a problem or suggest a book for the library.</p>
          </div>
        </div>
        <form onSubmit={handleSuggestionSubmit} className="mt-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-3">
            <select
              value={suggestion.category}
              onChange={(event) => setSuggestion((current) => ({ ...current, category: event.target.value }))}
              className="px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option>General Feedback</option>
              <option>Bug</option>
              <option>Book Request</option>
            </select>
            <textarea
              required
              maxLength={4000}
              rows={3}
              value={suggestion.description}
              onChange={(event) => setSuggestion((current) => ({ ...current, description: event.target.value }))}
              placeholder="Describe your suggestion or issue..."
              className="px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {suggestionStatus && <p className={`text-xs font-semibold ${suggestionStatus.type === "success" ? "text-emerald-600" : "text-rose-600"}`}>{suggestionStatus.text}</p>}
            <button type="submit" disabled={submittingSuggestion} className="sm:ml-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold disabled:opacity-60">
              <MessageSquare className="w-4 h-4" />
              {submittingSuggestion ? "Sending..." : "Send to Help Desk"}
            </button>
          </div>
        </form>
      </section>

      {/* Active Digital e-Books Shelf Section */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Active Digital e-Books ({digitalLoans.length}/2)
              </h2>
              <p className="text-xs text-slate-300">
                14-day online reading access with integrated in-browser reader.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/student/my-digital-books"
              className="text-xs font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-white/15 transition"
            >
              My Shelf
            </Link>
            <Link
              href="/student/digital-books"
              className="text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 px-3.5 py-1.5 rounded-xl transition shadow-sm inline-flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Browse e-Books
            </Link>
          </div>
        </div>

        {/* Shelf Content */}
        {digitalLoans.length === 0 ? (
          <div className="pt-5 pb-2 text-center text-slate-400 text-xs">
            <p>No active digital books borrowed. You have 2 slots available for instant online reading.</p>
            <Link
              href="/student/digital-books"
              className="mt-2.5 inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold"
            >
              Explore Digital Books Collection <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {digitalLoans.map((b) => (
              <div
                key={b.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4 hover:bg-white/10 transition"
              >
                <div className="min-w-0 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                    {b.book?.category || "Computer Science"}
                  </span>
                  <h4 className="font-bold text-sm text-white truncate" title={b.book?.title}>
                    {b.book?.title}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    {b.book?.author} • Due in {b.days_remaining} days
                  </p>
                </div>
                <Link
                  href={`/student/reader/${b.id}`}
                  className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shrink-0 transition flex items-center gap-1.5 shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Read
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Currently Borrowed Books Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Currently Borrowed Books</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live list of library books in your possession with automatic due date and fine tracking.
            </p>
          </div>
          <Link
            href="/student/digital-books"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition"
          >
            <Search className="w-3.5 h-3.5" />
            Browse Digital Books
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm animate-pulse">
            Checking your library records...
          </div>
        ) : activeLoans.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Books Currently Borrowed"
            description="You do not have any active book loans. Browse the digital library to explore reading titles available to you."
            actionLabel="Browse Digital Books"
            onAction={() => window.location.href = "/student/digital-books"}
          />
        ) : (
          <BorrowTable records={activeLoans} />
        )}
      </div>
    </div>
  );
}

