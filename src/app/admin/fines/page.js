"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { calculateFine, formatCurrency, formatDate } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";
import {
  Receipt,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  BookOpen,
  DollarSign,
  AlertTriangle
} from "lucide-react";

export default function AdminFinesPage() {
  const [finesList, setFinesList] = useState([]);
  const [filteredFines, setFilteredFines] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("unpaid"); // 'unpaid' | 'all' | 'paid'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const loadFines = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("borrow_records")
        .select(`
          *,
          books (title, author, isbn),
          profiles (full_name, roll_number, department, phone)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter and compute fines
      const processed = (data || []).map((record) => {
        const fineInfo = calculateFine(record.due_date, record.return_date);
        const fineAmount =
          record.status === "returned"
            ? Number(record.fine_amount || 0)
            : fineInfo.fine;

        return {
          ...record,
          calculatedFine: fineAmount,
          daysOverdue: fineInfo.daysOverdue,
          isOverdueNow: fineInfo.isOverdue,
        };
      });

      // Filter only records that have fines (> 0) or are overdue
      const recordsWithFines = processed.filter(
        (r) => r.calculatedFine > 0 || r.fine_amount > 0 || r.isOverdueNow
      );

      setFinesList(recordsWithFines);
      setFilteredFines(recordsWithFines);
    } catch (err) {
      console.error("Error loading fines:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFines();
  }, []);

  // Filter effect
  useEffect(() => {
    let list = [...finesList];

    if (filterType === "unpaid") {
      list = list.filter((r) => !r.fine_paid && r.calculatedFine > 0);
    } else if (filterType === "paid") {
      list = list.filter((r) => r.fine_paid && (r.fine_amount > 0 || r.calculatedFine > 0));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.profiles?.full_name?.toLowerCase().includes(q) ||
          r.profiles?.roll_number?.toLowerCase().includes(q) ||
          r.books?.title?.toLowerCase().includes(q) ||
          r.books?.isbn?.toLowerCase().includes(q)
      );
    }

    setFilteredFines(list);
  }, [searchQuery, filterType, finesList]);

  const handleMarkPaid = async (record) => {
    if (!confirm(`Mark fine of ${formatCurrency(record.calculatedFine)} as PAID for ${record.profiles?.full_name}?`)) {
      return;
    }

    setActionLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("borrow_records")
        .update({
          fine_paid: true,
          fine_amount: record.calculatedFine, // ensure latest calculated amount is recorded
        })
        .eq("id", record.id);

      if (error) throw error;

      setToastMessage(`Fine payment cleared for ${record.profiles?.full_name}!`);
      setTimeout(() => setToastMessage(null), 3500);

      await loadFines();
    } catch (err) {
      console.error("Payment update error:", err);
      alert(err.message || "Failed to mark fine as paid.");
    } finally {
      setActionLoading(false);
    }
  };

  // Compute total unpaid fines
  const totalUnpaidAmount = finesList
    .filter((r) => !r.fine_paid)
    .reduce((acc, curr) => acc + (curr.calculatedFine || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-600 text-white font-semibold text-xs sm:text-sm shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Overdue Fines & Fee Ledger
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track overdue book penalties accrued at ₹5/day, verify cash receipts, and mark settled fees.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
            ₹
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Total Unpaid Balance</p>
            <p className="text-xl font-extrabold text-amber-950">{formatCurrency(totalUnpaidAmount)}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student, roll no, or book..."
            className="block w-full pl-10 pr-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {[
            { id: "unpaid", label: "Outstanding Fines" },
            { id: "all", label: "All Records" },
            { id: "paid", label: "Settled / Paid" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                filterType === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fines Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm animate-pulse bg-white rounded-2xl border border-slate-200">
          Loading fine ledger records...
        </div>
      ) : filteredFines.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No Fine Records"
          description={
            filterType === "unpaid"
              ? "Awesome! There are no outstanding overdue fines pending collection."
              : "No fine entries match the selected filter."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">Book Title</th>
                <th className="px-5 py-3.5">Due Date</th>
                <th className="px-5 py-3.5">Return Status</th>
                <th className="px-5 py-3.5">Days Overdue</th>
                <th className="px-5 py-3.5">Fine Amount</th>
                <th className="px-5 py-3.5">Payment Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFines.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Student */}
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-bold text-slate-900">{record.profiles?.full_name}</p>
                      <p className="text-xs text-brand-600 font-mono font-semibold">Roll: {record.profiles?.roll_number}</p>
                      <p className="text-[11px] text-slate-400">{record.profiles?.department}</p>
                    </div>
                  </td>

                  {/* Book */}
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-bold text-slate-800 line-clamp-1">{record.books?.title}</p>
                      <p className="text-xs text-slate-500 font-mono">ISBN: {record.books?.isbn}</p>
                    </div>
                  </td>

                  {/* Due Date */}
                  <td className="px-5 py-4 text-xs font-medium text-slate-700">
                    {formatDate(record.due_date)}
                  </td>

                  {/* Return Status */}
                  <td className="px-5 py-4">
                    {record.status === "returned" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        Returned on {formatDate(record.return_date)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> Still Holding
                      </span>
                    )}
                  </td>

                  {/* Days Overdue */}
                  <td className="px-5 py-4 font-bold text-xs text-rose-600">
                    {record.daysOverdue > 0 ? `${record.daysOverdue} days` : "—"}
                  </td>

                  {/* Fine Amount */}
                  <td className="px-5 py-4">
                    <span className="text-sm font-extrabold text-slate-900">
                      {formatCurrency(record.calculatedFine)}
                    </span>
                    <span className="block text-[10px] text-slate-400">(@ ₹5/day)</span>
                  </td>

                  {/* Payment Status */}
                  <td className="px-5 py-4">
                    {record.fine_paid ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Paid & Cleared
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        <Clock className="w-3.5 h-3.5" /> Unpaid / Pending
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4 text-right">
                    {!record.fine_paid && record.calculatedFine > 0 ? (
                      <button
                        onClick={() => handleMarkPaid(record)}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-60"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark Paid
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No action needed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
