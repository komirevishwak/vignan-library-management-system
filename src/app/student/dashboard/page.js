"use client";

import { useEffect, useState } from "react";
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
  BookMarked,
  ArrowRight,
  ShieldAlert,
  Search,
  CheckCircle2
} from "lucide-react";

export default function StudentDashboardPage() {
  const [activeLoans, setActiveLoans] = useState([]);
  const [historyCount, setHistoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
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
          setHistoryCount(4);
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

        // Fetch count of returned records
        const { count: returnedCount } = await supabase
          .from("borrow_records")
          .select("*", { count: "exact", head: true })
          .eq("student_id", authUser.id)
          .eq("status", "returned");

        setHistoryCount(returnedCount || 0);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Compute metrics
  let totalPendingFine = 0;
  let overdueCount = 0;

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
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-900 via-brand-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-md mb-3 border border-white/10">
            <BookMarked className="w-3.5 h-3.5 text-brand-300" />
            <span>Active Student Membership</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back to Vignandhara Library
          </h1>
          <p className="text-sm text-slate-200 mt-1 max-w-lg">
            Track your borrowed academic books, return deadlines, and explore new library acquisitions.
          </p>
        </div>

        <div className="relative z-10 flex sm:flex-col gap-2">
          <Link
            href="/student/catalog"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand-900 hover:bg-slate-100 font-bold text-sm shadow-md transition"
          >
            <Search className="w-4 h-4" />
            Search Catalog
          </Link>
          <Link
            href="/student/history"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition"
          >
            Loan History
          </Link>
        </div>
      </div>

      {/* Overdue Alert Banner if any book is overdue */}
      {overdueCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-rose-900">
                Action Required: {overdueCount} {overdueCount === 1 ? "Book is" : "Books are"} Overdue!
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Please return overdue books to the circulation desk promptly. Fine accrues at ₹5/day.
              </p>
            </div>
          </div>
          <div className="font-bold text-sm text-rose-800 bg-white px-3.5 py-1.5 rounded-xl border border-rose-200 self-start sm:self-auto">
            Fine Due: {formatCurrency(totalPendingFine)}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Currently Borrowed"
          value={loading ? "..." : activeLoans.length}
          subtitle="Max limit: 3 books"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Overdue Books"
          value={loading ? "..." : overdueCount}
          subtitle={overdueCount > 0 ? "Requires urgent return" : "All books on time"}
          icon={Clock}
          color={overdueCount > 0 ? "rose" : "emerald"}
          alert={overdueCount > 0}
        />
        <StatCard
          title="Pending Fines"
          value={loading ? "..." : formatCurrency(totalPendingFine)}
          subtitle="Payable at circulation counter"
          icon={Receipt}
          color={totalPendingFine > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Returned Books"
          value={loading ? "..." : historyCount}
          subtitle="Total books completed"
          icon={CheckCircle2}
          color="purple"
        />
      </div>

      {/* Active Borrowed Books Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Currently Borrowed Books</h3>
            <p className="text-xs text-slate-500 mt-0.5">Active titles currently in your possession.</p>
          </div>
          <Link
            href="/student/catalog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
          >
            Borrow New Title <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm animate-pulse">
            Loading your borrowed books...
          </div>
        ) : activeLoans.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Books Currently Borrowed"
            description="You do not have any active book loans right now. Explore our catalog to find textbooks and reference materials."
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
