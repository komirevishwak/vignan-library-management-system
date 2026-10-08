"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import BorrowTable from "@/components/BorrowTable";
import EmptyState from "@/components/EmptyState";
import { calculateFine } from "@/lib/utils";
import { History, Search, Filter, BookOpen } from "lucide-react";

export default function StudentHistoryPage() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
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
          .eq("student_id", user.id)
          .order("issue_date", { ascending: false });

        if (error) {
          console.error("Error loading history:", error);
        } else {
          setRecords(data || []);
          setFilteredRecords(data || []);
        }
      } catch (err) {
        console.error("History fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  useEffect(() => {
    let list = [...records];

    if (statusFilter !== "all") {
      list = list.filter((r) => {
        const effectiveStatus =
          r.status === "issued" && calculateFine(r.due_date, r.return_date).isOverdue
            ? "overdue"
            : r.status;
        return effectiveStatus === statusFilter;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.books?.title?.toLowerCase().includes(q) ||
          r.books?.author?.toLowerCase().includes(q) ||
          r.books?.isbn?.toLowerCase().includes(q)
      );
    }

    setFilteredRecords(list);
  }, [searchQuery, statusFilter, records]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Borrow & Return History
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete log of all books borrowed, return confirmations, and fine payment records.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, or ISBN..."
            className="block w-full pl-10 pr-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
          {[
            { id: "all", label: "All History" },
            { id: "issued", label: "Active Loans" },
            { id: "overdue", label: "Overdue" },
            { id: "returned", label: "Returned" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                statusFilter === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm animate-pulse bg-white rounded-2xl border border-slate-200">
          Loading your history logs...
        </div>
      ) : filteredRecords.length === 0 ? (
        <EmptyState
          icon={History}
          title="No History Found"
          description={
            searchQuery || statusFilter !== "all"
              ? "No records match the selected filter criteria."
              : "You haven't borrowed any books yet."
          }
          actionLabel={records.length === 0 ? "Browse Book Catalog" : "Clear Filter"}
          onAction={() => {
            if (records.length === 0) {
              window.location.href = "/student/catalog";
            } else {
              setSearchQuery("");
              setStatusFilter("all");
            }
          }}
        />
      ) : (
        <BorrowTable records={filteredRecords} />
      )}
    </div>
  );
}
