"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { calculateFine, formatCurrency, formatDate } from "@/lib/utils";
import StatCard from "@/components/StatCard";
import BorrowTable from "@/components/BorrowTable";
import {
  BookOpen,
  Users,
  Clock,
  AlertTriangle,
  Receipt,
  ArrowLeftRight,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  BookMarked
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalStudents: 0,
    currentlyIssued: 0,
    overdueCount: 0,
    totalPendingFines: 0,
  });
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminDashboard() {
      try {
        const supabase = createClient();

        // 1. Total Books
        const { count: booksCount } = await supabase
          .from("books")
          .select("*", { count: "exact", head: true });

        // 2. Total Students
        const { count: studentsCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "student");

        // 3. Active Borrow Records
        const { data: activeBorrows } = await supabase
          .from("borrow_records")
          .select(`
            *,
            books (title, author, isbn, cover_url),
            profiles (full_name, roll_number, department)
          `)
          .neq("status", "returned")
          .order("issue_date", { ascending: false });

        // 4. Calculate Overdue and Pending Fines
        let overdue = 0;
        let fines = 0;

        if (activeBorrows && activeBorrows.length > 0) {
          activeBorrows.forEach((b) => {
            const fineInfo = calculateFine(b.due_date, b.return_date);
            if (fineInfo.isOverdue) {
              overdue++;
              if (!b.fine_paid) fines += fineInfo.fine;
            } else if (b.fine_amount > 0 && !b.fine_paid) {
              fines += Number(b.fine_amount);
            }
          });
        }

        // Also add unpaid fines from returned records
        const { data: unpaidReturned } = await supabase
          .from("borrow_records")
          .select("fine_amount")
          .eq("status", "returned")
          .eq("fine_paid", false)
          .gt("fine_amount", 0);

        if (unpaidReturned) {
          unpaidReturned.forEach((r) => {
            fines += Number(r.fine_amount || 0);
          });
        }

        // Recent Loans stream
        const { data: recent } = await supabase
          .from("borrow_records")
          .select(`
            *,
            books (title, author, isbn, cover_url),
            profiles (full_name, roll_number, department)
          `)
          .order("created_at", { ascending: false })
          .limit(8);

        if (!booksCount && (!recent || recent.length === 0)) {
          // Demo mode mock stats
          setStats({
            totalBooks: 12,
            totalStudents: 148,
            currentlyIssued: 24,
            overdueCount: 4,
            totalPendingFines: 380,
          });
          setRecentLoans([
            {
              id: "demo-r1",
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
              profiles: {
                full_name: "Rahul Sharma",
                roll_number: "21CS019",
                department: "Computer Science",
              },
            },
            {
              id: "demo-r2",
              issue_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
              due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
              status: "issued",
              fine_amount: 0,
              fine_paid: false,
              books: {
                title: "Clean Code: Agile Software Craftsmanship",
                author: "Robert C. Martin",
                isbn: "978-0132350884",
                cover_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60",
              },
              profiles: {
                full_name: "Priya Patel",
                roll_number: "22EC055",
                department: "Electronics & Communication",
              },
            },
          ]);
        } else {
          setStats({
            totalBooks: booksCount || 0,
            totalStudents: studentsCount || 0,
            currentlyIssued: activeBorrows?.length || 0,
            overdueCount: overdue,
            totalPendingFines: fines,
          });
          setRecentLoans(recent || []);
        }
      } catch (err) {
        console.error("Admin dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAdminDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Circulation & Inventory Master Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Library Administration Dashboard
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Monitor real-time book circulation, overdue tracking, student records, and fine collections across all campus departments.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/issue-return"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/30 transition"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Issue / Return
          </Link>
          <Link
            href="/admin/books"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Add Book
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Books"
          value={loading ? "..." : stats.totalBooks}
          subtitle="Registered in catalog"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Students"
          value={loading ? "..." : stats.totalStudents}
          subtitle="Registered members"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Currently Issued"
          value={loading ? "..." : stats.currentlyIssued}
          subtitle="Active loans"
          icon={ArrowLeftRight}
          color="emerald"
        />
        <StatCard
          title="Overdue Books"
          value={loading ? "..." : stats.overdueCount}
          subtitle={stats.overdueCount > 0 ? "Requires attention" : "Zero overdue"}
          icon={Clock}
          color={stats.overdueCount > 0 ? "rose" : "emerald"}
          alert={stats.overdueCount > 0}
        />
        <StatCard
          title="Pending Fines"
          value={loading ? "..." : formatCurrency(stats.totalPendingFines)}
          subtitle="Total uncollected"
          icon={Receipt}
          color={stats.totalPendingFines > 0 ? "amber" : "emerald"}
        />
      </div>

      {/* Quick Access Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/issue-return"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-brand-300 hover:shadow-md transition flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
              Issue & Return Desk
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Quick issue (+14d) & return with auto ₹5/day fine</p>
          </div>
        </Link>

        <Link
          href="/admin/books"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-brand-300 hover:shadow-md transition flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
              Book Inventory & Art
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Add, edit stock copies, and upload book covers</p>
          </div>
        </Link>

        <Link
          href="/admin/fines"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-brand-300 hover:shadow-md transition flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
              Overdue Fines Ledger
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Review unpaid penalty balances and clear fines</p>
          </div>
        </Link>
      </div>

      {/* Recent Circulation Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Circulation Activity</h3>
            <p className="text-xs text-slate-500 mt-0.5">Latest book checkouts and return transactions.</p>
          </div>
          <Link
            href="/admin/issue-return"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
          >
            Manage All Loans <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm animate-pulse">
            Loading circulation records...
          </div>
        ) : recentLoans.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">
            No circulation activity recorded yet.
          </div>
        ) : (
          <BorrowTable records={recentLoans} showStudent={true} />
        )}
      </div>
    </div>
  );
}
