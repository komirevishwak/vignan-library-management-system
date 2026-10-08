"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, ArrowDown, ArrowUp, BookOpen, CheckCircle2, Clock3, MessageSquare, Search, Users } from "lucide-react";

const ACTIVE_WINDOW_MINUTES = 15;

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ students: 0, available: 0, inUse: 0, active: 0 });
  const [students, setStudents] = useState([]);
  const [issues, setIssues] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortAscending, setSortAscending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    const supabase = createClient();
    setError(null);

    const [{ data: profileRows, error: profileError }, { data: bookRows, error: bookError }, { data: issueRows, error: issueError }] = await Promise.all([
      supabase.from("profiles").select("*").eq("role", "student"),
      supabase.from("books").select("id, total_copies, available_copies"),
      supabase.from("suggestions").select("*").order("created_at", { ascending: false }),
    ]);

    if (profileError || bookError || issueError) {
      setError(profileError?.message || bookError?.message || issueError?.message || "Unable to load admin data.");
      setLoading(false);
      return;
    }

    const profiles = profileRows || [];
    const books = bookRows || [];
    const activeSince = Date.now() - ACTIVE_WINDOW_MINUTES * 60 * 1000;
    setStudents(profiles);
    setIssues((issueRows || []).map((issue) => ({
      ...issue,
      student: profiles.find((profile) => profile.id === issue.student_id),
    })));
    setStats({
      students: profiles.length,
      available: books.reduce((sum, book) => sum + Number(book.available_copies || 0), 0),
      inUse: books.reduce((sum, book) => sum + Math.max(0, Number(book.total_copies || 0) - Number(book.available_copies || 0)), 0),
      active: profiles.filter((profile) => profile.last_seen_at && new Date(profile.last_seen_at).getTime() >= activeSince).length,
    });
    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
    const supabase = createClient();
    const channel = supabase
      .channel("admin-dashboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, loadDashboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "books" }, loadDashboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "suggestions" }, loadDashboard)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const visibleStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students
      .filter((student) => !query || [student.full_name, student.roll_number, student.email, student.department].some((value) => value?.toLowerCase().includes(query)))
      .sort((first, second) => {
        const left = String(first[sortField] || "").toLowerCase();
        const right = String(second[sortField] || "").toLowerCase();
        return (left > right ? 1 : left < right ? -1 : 0) * (sortAscending ? 1 : -1);
      });
  }, [students, search, sortField, sortAscending]);

  const openStudent = async (student) => {
    setSelectedStudent(student);
    const supabase = createClient();
    const { data } = await supabase
      .from("borrow_records")
      .select("*, books(title, author, isbn)")
      .eq("student_id", student.id)
      .order("issue_date", { ascending: false });
    setBorrowHistory(data || []);
  };

  const updateIssueStatus = async (issueId, status) => {
    const supabase = createClient();
    const { error: updateError } = await supabase.from("suggestions").update({ status, updated_at: new Date().toISOString() }).eq("id", issueId);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setIssues((current) => current.map((issue) => issue.id === issueId ? { ...issue, status } : issue));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Operations Overview</h2>
          <p className="text-sm text-slate-500 mt-1">Live student, circulation, and help desk activity.</p>
        </div>
        <p className="text-xs text-slate-500">Active means seen within the last {ACTIVE_WINDOW_MINUTES} minutes.</p>
      </div>

      {error && <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex gap-2"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Registered Students", stats.students, Users, "text-blue-600", "students"],
          ["Books Available", stats.available, BookOpen, "text-emerald-600", "in stock"],
          ["Books In Use", stats.inUse, Clock3, "text-amber-600", "checked out"],
          ["Active Students", stats.active, CheckCircle2, "text-brand-600", `last ${ACTIVE_WINDOW_MINUTES} min`],
        ].map(([label, value, Icon, color, hint]) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><Icon className={`w-5 h-5 ${color}`} /></div>
            <p className="text-3xl font-extrabold text-slate-900 mt-3">{loading ? "..." : value}</p>
            <p className="text-xs text-slate-400 mt-1">{hint}</p>
          </div>
        ))}
      </section>

      <section id="students" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div><h3 className="text-lg font-bold text-slate-900">Student Directory</h3><p className="text-xs text-slate-500 mt-1">Select a student to view profile and borrowing history.</p></div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative"><Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students" className="pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm" /></div>
            <button onClick={() => { setSortField("created_at"); setSortAscending((value) => !value); }} className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700">Registration {sortAscending ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}</button>
          </div>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Roll Number</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Registered</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleStudents.map((student) => <tr key={student.id} onClick={() => openStudent(student)} className="cursor-pointer hover:bg-brand-50/50"><td className="px-5 py-3 font-semibold text-slate-900">{student.full_name}</td><td className="px-5 py-3 font-mono text-xs text-slate-600">{student.roll_number || "-"}</td><td className="px-5 py-3 text-slate-600">{student.email}</td><td className="px-5 py-3 text-slate-500">{formatDate(student.created_at)}</td><td className="px-5 py-3"><span className={`text-xs font-bold ${student.is_active ? "text-emerald-600" : "text-rose-600"}`}>{student.is_active ? "Active" : "Inactive"}</span></td></tr>)}{visibleStudents.length === 0 && <tr><td colSpan="5" className="px-5 py-10 text-center text-sm text-slate-500">No students found.</td></tr>}</tbody></table></div>
      </section>

      <section id="help-desk" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200"><h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-brand-600" /> Help Desk</h3><p className="text-xs text-slate-500 mt-1">Suggestions and reported problems submitted by students.</p></div>
        <div className="divide-y divide-slate-100">{issues.map((issue) => <div key={issue.id} className="p-5 flex flex-col lg:flex-row lg:items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 rounded-full px-2 py-1">{issue.category}</span><span className="text-xs text-slate-400">{formatDate(issue.created_at)}</span></div><p className="text-sm font-semibold text-slate-900 mt-2 whitespace-pre-wrap">{issue.description}</p><p className="text-xs text-slate-500 mt-2">{issue.student?.full_name || "Student"} · ID: {issue.student?.roll_number || issue.student_id}</p></div><select value={issue.status} onChange={(event) => updateIssueStatus(issue.id, event.target.value)} className="w-full lg:w-40 px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold"><option>Open</option><option>In Progress</option><option>Resolved</option></select></div>)}{issues.length === 0 && <p className="p-10 text-center text-sm text-slate-500">No suggestions or issues have been reported.</p>}</div>
      </section>

      {selectedStudent && <div className="fixed inset-0 z-40 bg-slate-950/50 p-4 flex items-center justify-center" onClick={() => setSelectedStudent(null)}><div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-extrabold text-slate-900">{selectedStudent.full_name}</h3><p className="text-sm text-slate-500 mt-1">{selectedStudent.email} · {selectedStudent.roll_number || "No roll number"}</p></div><button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-800 text-xl">×</button></div><div className="grid grid-cols-2 gap-3 mt-6 text-sm"><div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-500">Department</p><p className="font-semibold mt-1">{selectedStudent.department || "-"}</p></div><div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-500">Year</p><p className="font-semibold mt-1">{selectedStudent.year || "-"}</p></div><div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-500">Phone</p><p className="font-semibold mt-1">{selectedStudent.phone || "-"}</p></div><div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-500">Registered</p><p className="font-semibold mt-1">{formatDate(selectedStudent.created_at)}</p></div></div><h4 className="font-bold text-slate-900 mt-6 mb-3">Borrowing History</h4><div className="space-y-2">{borrowHistory.map((record) => <div key={record.id} className="border border-slate-200 rounded-xl p-3 text-sm"><p className="font-semibold">{record.books?.title || "Book"}</p><p className="text-xs text-slate-500 mt-1">{record.status} · Issued {formatDate(record.issue_date)} · Due {formatDate(record.due_date)}</p></div>)}{borrowHistory.length === 0 && <p className="text-sm text-slate-500">No borrowing history found.</p>}</div></div></div>}
    </div>
  );
}
