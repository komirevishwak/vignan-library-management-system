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
  Calendar
} from "lucide-react";

export default function StudentDashboardPage() {
  const [activeLoans, setActiveLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      if (!authUser) {
        // Demo fallback
        const mockLoans = [
          {
            id: "demo-1",
            issue_date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
            due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: "overdue",
            fine_amount: 10,
            fine_paid: false,
            books: {
              title: "Introduction to Algorithms (4th Edition)",
              author: "Thomas H. Cormen",
              isbn: "978-0262046305",
              cover_url: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=500&auto=format&fit=crop&q=60",
            },
          },
          {
            id: "demo-2",
            issue_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            due_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
            status: "issued",
            fine_amount: 0,
            fine_paid: false,
            books: {
              title: "Clean Code: Agile Software Craftsmanship",
              author: "Robert C. Martin",
              isbn: "978-0132350884",
              cover_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60",
            },
          },
        ];
        setActiveLoans(mockLoans);
        setLoading(false);
        return;
      }

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

      {/* The 3 Essential Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Books Currently Borrowed */}
        <StatCard
          title="Books Currently Borrowed"
          value={loading ? "..." : activeLoans.length}
          subtitle={activeLoans.length > 0 ? "Standard quota: 3 books" : "No active loans"}
          icon={BookOpen}
          color="blue"
        />

        {/* Metric 2: Next Due Date */}
        <StatCard
          title="Next Return Due Date"
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
              ? "Return before deadline to avoid ₹5/day fine"
              : "All clear"
          }
          icon={Calendar}
          color={overdueCount > 0 ? "rose" : "emerald"}
          alert={overdueCount > 0}
        />

        {/* Metric 3: Total Fine Owed (Auto-Calculated) */}
        <StatCard
          title="Total Fine Owed"
          value={loading ? "..." : formatCurrency(totalPendingFine)}
          subtitle={totalPendingFine > 0 ? "Calculated automatically at ₹5/day" : "Zero penalty balance"}
          icon={Receipt}
          color={totalPendingFine > 0 ? "amber" : "emerald"}
          alert={totalPendingFine > 0}
        />
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
            href="/student/catalog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition"
          >
            <Search className="w-3.5 h-3.5" />
            Browse Catalog
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
            description="You do not have any active book loans. Search our book catalog to explore available textbooks and reference copies."
            actionLabel="Browse Book Catalog"
            onAction={() => window.location.href = "/student/catalog"}
          />
        ) : (
          <BorrowTable records={activeLoans} />
        )}
      </div>
    </div>
  );
}

