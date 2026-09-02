"use client";

import { formatDate, formatCurrency, calculateFine } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Clock, BookOpen, User } from "lucide-react";

export default function BorrowTable({ records = [], showStudent = false, onReturnBook, onPayFine }) {
  if (!records || records.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
          <tr>
            <th className="px-5 py-3.5">Book Details</th>
            {showStudent && <th className="px-5 py-3.5">Student</th>}
            <th className="px-5 py-3.5">Issue Date</th>
            <th className="px-5 py-3.5">Due Date</th>
            <th className="px-5 py-3.5">Status</th>
            <th className="px-5 py-3.5">Fine</th>
            {(onReturnBook || onPayFine) && <th className="px-5 py-3.5 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {records.map((record) => {
            const fineInfo = calculateFine(record.due_date, record.return_date);
            const isOverdue = record.status === "overdue" || (record.status === "issued" && fineInfo.isOverdue);
            const fineDue = record.status === "returned" ? (record.fine_amount || 0) : fineInfo.fine;

            return (
              <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                {/* Book Title & Author */}
                <td className="px-5 py-4 font-medium text-slate-900">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-12 rounded bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {record.books?.cover_url ? (
                        <img src={record.books.cover_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 line-clamp-1">{record.books?.title || "Unknown Book"}</p>
                      <p className="text-xs text-slate-500">by {record.books?.author || "N/A"}</p>
                      <span className="text-[10px] text-slate-400 font-mono">ISBN: {record.books?.isbn || "N/A"}</span>
                    </div>
                  </div>
                </td>

                {/* Student info (Admin view) */}
                {showStudent && (
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-slate-800">{record.profiles?.full_name || "Student"}</p>
                      <p className="text-xs text-slate-500">Roll: {record.profiles?.roll_number || "N/A"}</p>
                      <p className="text-[11px] text-slate-400">{record.profiles?.department}</p>
                    </div>
                  </td>
                )}

                {/* Issue Date */}
                <td className="px-5 py-4 text-xs font-medium text-slate-600">
                  {formatDate(record.issue_date)}
                </td>

                {/* Due Date */}
                <td className="px-5 py-4 text-xs font-medium">
                  <div className="flex flex-col">
                    <span className={isOverdue ? "text-rose-600 font-bold" : "text-slate-700"}>
                      {formatDate(record.due_date)}
                    </span>
                    {record.status === "issued" && (
                      <span className={`text-[10px] ${isOverdue ? "text-rose-500 font-semibold" : "text-slate-400"}`}>
                        {isOverdue ? `${fineInfo.daysOverdue} days overdue` : "Active Loan"}
                      </span>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  {record.status === "returned" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Returned
                    </span>
                  ) : isOverdue ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Overdue
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                      <Clock className="w-3.5 h-3.5" /> Issued
                    </span>
                  )}
                </td>

                {/* Fine */}
                <td className="px-5 py-4">
                  {fineDue > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-rose-600">{formatCurrency(fineDue)}</span>
                      <span className={`text-[10px] font-semibold ${record.fine_paid ? "text-emerald-600" : "text-rose-500"}`}>
                        {record.fine_paid ? "Paid" : "Pending"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">₹0</span>
                  )}
                </td>

                {/* Actions */}
                {(onReturnBook || onPayFine) && (
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {record.status === "issued" && onReturnBook && (
                        <button
                          onClick={() => onReturnBook(record)}
                          className="px-3 py-1.5 text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-lg border border-brand-200 transition"
                        >
                          Mark Returned
                        </button>
                      )}
                      {fineDue > 0 && !record.fine_paid && onPayFine && (
                        <button
                          onClick={() => onPayFine(record)}
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition"
                        >
                          Clear Fine
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
