"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { calculateFine, formatCurrency, formatDate } from "@/lib/utils";
import BorrowTable from "@/components/BorrowTable";
import EmptyState from "@/components/EmptyState";
import {
  ArrowLeftRight,
  BookOpen,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Check,
  AlertTriangle,
  RotateCcw
} from "lucide-react";

export default function AdminIssueReturnPage() {
  const [activeTab, setActiveTab] = useState("issue"); // 'issue' | 'return'
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Issue Form State
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [dueDateDays, setDueDateDays] = useState(14); // Default 14 days
  const [submittingIssue, setSubmittingIssue] = useState(false);
  const [issueError, setIssueError] = useState(null);
  const [issueSuccess, setIssueSuccess] = useState(null);

  // Return Form State
  const [returnSearch, setReturnSearch] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // 1. Fetch Students
      const { data: studentList } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")
        .order("full_name", { ascending: true });

      // 2. Fetch Books
      const { data: bookList } = await supabase
        .from("books")
        .select("*")
        .order("title", { ascending: true });

      // 3. Fetch Active Loans (issued or overdue)
      const { data: loans } = await supabase
        .from("borrow_records")
        .select(`
          *,
          books (title, author, isbn, cover_url, available_copies),
          profiles (full_name, roll_number, department, phone)
        `)
        .neq("status", "returned")
        .order("issue_date", { ascending: false });

      setStudents(studentList || []);
      setBooks(bookList || []);
      setActiveLoans(loans || []);
    } catch (err) {
      console.error("Error loading issue/return data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered lists for dropdown / search
  const filteredStudents = students.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.roll_number?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredBooks = books.filter(
    (b) =>
      b.title?.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author?.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.isbn?.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const filteredLoans = activeLoans.filter(
    (l) =>
      l.books?.title?.toLowerCase().includes(returnSearch.toLowerCase()) ||
      l.books?.isbn?.toLowerCase().includes(returnSearch.toLowerCase()) ||
      l.profiles?.full_name?.toLowerCase().includes(returnSearch.toLowerCase()) ||
      l.profiles?.roll_number?.toLowerCase().includes(returnSearch.toLowerCase())
  );

  // Handle Book Issue
  const handleIssueBook = async (e) => {
    e.preventDefault();
    setIssueError(null);
    setIssueSuccess(null);

    if (!selectedStudentId) {
      setIssueError("Please select a registered student.");
      return;
    }

    if (!selectedBookId) {
      setIssueError("Please select a book to issue.");
      return;
    }

    const bookObj = books.find((b) => b.id === selectedBookId);
    if (!bookObj || (bookObj.available_copies || 0) <= 0) {
      setIssueError("This book is currently out of stock. No copies available to issue.");
      return;
    }

    const studentObj = students.find((s) => s.id === selectedStudentId);
    if (studentObj && studentObj.is_active === false) {
      setIssueError("This student account is deactivated. Cannot issue books.");
      return;
    }

    // Check student's current active loans
    const studentCurrentLoans = activeLoans.filter((l) => l.student_id === selectedStudentId);
    if (studentCurrentLoans.length >= 3) {
      if (
        !confirm(
          `Warning: ${studentObj?.full_name} already holds ${studentCurrentLoans.length} active books (Standard quota is 3). Do you want to proceed with issuing an extra copy?`
        )
      ) {
        return;
      }
    }

    setSubmittingIssue(true);

    try {
      const supabase = createClient();
      const issueDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Number(dueDateDays));

      // 1. Create borrow record
      const { error: insertError } = await supabase.from("borrow_records").insert({
        student_id: selectedStudentId,
        book_id: selectedBookId,
        issue_date: issueDate.toISOString(),
        due_date: dueDate.toISOString(),
        status: "issued",
        fine_amount: 0,
        fine_paid: false,
      });

      if (insertError) throw insertError;

      // 2. Decrement available copies of the book
      const { error: updateBookError } = await supabase
        .from("books")
        .update({
          available_copies: Math.max(0, (bookObj.available_copies || 1) - 1),
        })
        .eq("id", selectedBookId);

      if (updateBookError) throw updateBookError;

      setIssueSuccess(
        `Successfully issued "${bookObj.title}" to ${studentObj?.full_name} (Due on ${dueDate.toLocaleDateString()})`
      );

      // Reset selection
      setSelectedBookId("");
      setSelectedStudentId("");
      setStudentSearch("");
      setBookSearch("");

      await loadData();
    } catch (err) {
      console.error("Issue error:", err);
      setIssueError(err.message || "Failed to issue book. Please try again.");
    } finally {
      setSubmittingIssue(false);
    }
  };

  // Handle Book Return
  const handleReturnBook = async (record) => {
    const fineInfo = calculateFine(record.due_date);
    const confirmMessage = fineInfo.isOverdue
      ? `Confirm return of "${record.books?.title}" by ${record.profiles?.full_name}?\n\nOverdue Notice: ${fineInfo.daysOverdue} days overdue. Calculated fine: ₹${fineInfo.fine}.`
      : `Confirm return of "${record.books?.title}" by ${record.profiles?.full_name}?`;

    if (!confirm(confirmMessage)) return;

    setSubmittingReturn(true);

    try {
      const supabase = createClient();
      const returnDate = new Date().toISOString();

      // 1. Update borrow record status to returned
      const { error: updateBorrowError } = await supabase
        .from("borrow_records")
        .update({
          return_date: returnDate,
          status: "returned",
          fine_amount: fineInfo.fine,
          fine_paid: fineInfo.fine === 0, // auto paid if ₹0
        })
        .eq("id", record.id);

      if (updateBorrowError) throw updateBorrowError;

      // 2. Increment book available copies
      const currentAvailable = record.books?.available_copies ?? 0;
      const { error: updateBookError } = await supabase
        .from("books")
        .update({
          available_copies: currentAvailable + 1,
        })
        .eq("id", record.book_id);

      if (updateBookError) throw updateBookError;

      setReturnSuccess(
        `"${record.books?.title}" returned successfully! ${
          fineInfo.fine > 0 ? `Fine of ₹${fineInfo.fine} recorded.` : ""
        }`
      );
      setTimeout(() => setReturnSuccess(null), 4000);

      await loadData();
    } catch (err) {
      console.error("Return error:", err);
      alert(err.message || "Failed to record book return.");
    } finally {
      setSubmittingReturn(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Circulation Desk: Issue & Return Books
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Issue new book loans with automatic 14-day due dates or process returns with automatic ₹5/day overdue fine calculation.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab("issue")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === "issue"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Issue Book to Student
        </button>

        <button
          onClick={() => setActiveTab("return")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === "return"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          Process Return ({activeLoans.length} Active Loans)
        </button>
      </div>

      {/* TAB 1: ISSUE BOOK */}
      {activeTab === "issue" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-4xl">
          {issueSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Book Issued Successfully</p>
                <p className="text-xs text-emerald-700 mt-0.5">{issueSuccess}</p>
              </div>
            </div>
          )}

          {issueError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Issue Request Failed</p>
                <p className="text-xs text-rose-700 mt-0.5">{issueError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleIssueBook} className="space-y-6">
            {/* Step 1: Select Student */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                1. Select Student (Search by Roll No or Name) *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search student..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="">-- Choose Student ({filteredStudents.length} available) --</option>
                  {filteredStudents.map((s) => (
                    <option key={s.id} value={s.id} disabled={s.is_active === false}>
                      {s.full_name} ({s.roll_number}) - {s.department} {s.is_active === false ? "[DEACTIVATED]" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 2: Select Book */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                2. Select Book to Issue (Search by Title or ISBN) *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                    placeholder="Search book title or ISBN..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <select
                  required
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="">-- Choose Book ({filteredBooks.length} available) --</option>
                  {filteredBooks.map((b) => (
                    <option
                      key={b.id}
                      value={b.id}
                      disabled={b.available_copies <= 0}
                    >
                      {b.title} ({b.available_copies} available) — ISBN: {b.isbn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 3: Loan Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Loan Duration (Default: 14 Days)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={dueDateDays}
                    onChange={(e) => setDueDateDays(e.target.value)}
                    className="w-24 px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-xs text-slate-500">days from today</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex flex-col justify-center">
                <p className="font-semibold text-slate-800">
                  Calculated Due Date:{" "}
                  <span className="text-brand-600 font-bold">
                    {new Date(Date.now() + Number(dueDateDays) * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Overdue rate: ₹5.00/day after this date</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={submittingIssue}
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-600/30 transition disabled:opacity-60 flex items-center gap-2"
              >
                <ArrowLeftRight className="w-4 h-4" />
                {submittingIssue ? "Processing Issue..." : "Confirm & Issue Book"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: RETURN BOOK */}
      {activeTab === "return" && (
        <div className="space-y-4">
          {returnSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{returnSuccess}</span>
            </div>
          )}

          {/* Search Active Loans */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={returnSearch}
                onChange={(e) => setReturnSearch(e.target.value)}
                placeholder="Search active loan by student name, roll no, or book title..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium hidden sm:block">
              {filteredLoans.length} currently issued books
            </span>
          </div>

          {/* Active Loans Table */}
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm animate-pulse bg-white rounded-2xl border border-slate-200">
              Loading active loans...
            </div>
          ) : filteredLoans.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No Active Loans to Return"
              description={
                returnSearch
                  ? "No active loan matches the search term."
                  : "All borrowed books have been returned to the library!"
              }
            />
          ) : (
            <BorrowTable
              records={filteredLoans}
              showStudent={true}
              onReturnBook={handleReturnBook}
            />
          )}
        </div>
      )}
    </div>
  );
}
