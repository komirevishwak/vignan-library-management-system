"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEPARTMENTS, STUDY_YEARS } from "@/lib/utils";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";
import BorrowTable from "@/components/BorrowTable";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Eye,
  GraduationCap,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [loading, setLoading] = useState(true);

  // Selected student for details modal
  const [viewStudent, setViewStudent] = useState(null);
  const [studentBorrows, setStudentBorrows] = useState([]);
  const [loadingBorrows, setLoadingBorrows] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStudents(data || []);
      setFilteredStudents(data || []);
    } catch (err) {
      console.error("Error loading students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Filter effect
  useEffect(() => {
    let list = [...students];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.full_name?.toLowerCase().includes(q) ||
          s.roll_number?.toLowerCase().includes(q) ||
          s.department?.toLowerCase().includes(q) ||
          s.phone?.includes(q)
      );
    }

    if (selectedDept !== "All") {
      list = list.filter((s) => s.department === selectedDept);
    }

    setFilteredStudents(list);
  }, [searchQuery, selectedDept, students]);

  const handleOpenStudentDetails = async (student) => {
    setViewStudent(student);
    setLoadingBorrows(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("borrow_records")
        .select(`
          *,
          books (title, author, isbn, cover_url)
        `)
        .eq("student_id", student.id)
        .order("issue_date", { ascending: false });

      if (error) throw error;
      setStudentBorrows(data || []);
    } catch (err) {
      console.error("Error loading student borrow records:", err);
    } finally {
      setLoadingBorrows(false);
    }
  };

  const handleToggleActive = async (student) => {
    const newStatus = !student.is_active;
    const confirmMsg = newStatus
      ? `Reactivate student account for ${student.full_name}?`
      : `Deactivate student account for ${student.full_name}? (They will not be able to borrow books or log in)`;

    if (!confirm(confirmMsg)) return;

    setActionLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: newStatus })
        .eq("id", student.id);

      if (error) throw error;

      // Update state locally
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, is_active: newStatus } : s))
      );

      if (viewStudent && viewStudent.id === student.id) {
        setViewStudent((prev) => ({ ...prev, is_active: newStatus }));
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert(err.message || "Failed to update account status.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Registered Students Directory
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review student memberships, branch affiliations, borrow histories, and active account privileges.
        </p>
      </div>

      {/* Search & Dept Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, roll no, or phone..."
            className="block w-full pl-10 pr-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="w-full sm:w-72">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm animate-pulse bg-white rounded-2xl border border-slate-200">
          Loading student records...
        </div>
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Students Found"
          description={
            searchQuery || selectedDept !== "All"
              ? "No student matches the search filter."
              : "No students have registered in the portal yet."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Student Details</th>
                <th className="px-5 py-3.5">Roll Number</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Year</th>
                <th className="px-5 py-3.5">Contact</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-xs text-slate-600">
                        {student.photo_url ? (
                          <img src={student.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          student.full_name?.[0]?.toUpperCase() || "S"
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{student.full_name}</p>
                        <span className="text-[10px] text-slate-400">Registered: {new Date(student.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 font-mono font-bold text-xs text-brand-700">
                    {student.roll_number || "N/A"}
                  </td>

                  <td className="px-5 py-4 text-xs text-slate-700">
                    {student.department || "General"}
                  </td>

                  <td className="px-5 py-4 text-xs text-slate-600">
                    {student.year || "N/A"}
                  </td>

                  <td className="px-5 py-4 text-xs text-slate-600">
                    {student.phone || "—"}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        student.is_active !== false
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {student.is_active !== false ? "Active" : "Deactivated"}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenStudentDetails(student)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>

                      <button
                        onClick={() => handleToggleActive(student)}
                        disabled={actionLoading}
                        className={`p-1.5 rounded-lg transition ${
                          student.is_active !== false
                            ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={student.is_active !== false ? "Deactivate Account" : "Reactivate Account"}
                      >
                        {student.is_active !== false ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Student Details & Loans Modal */}
      <Modal
        isOpen={!!viewStudent}
        onClose={() => setViewStudent(null)}
        title="Student Profile & Loan Records"
        maxWidth="max-w-3xl"
      >
        {viewStudent && (
          <div className="space-y-6">
            {/* Student Info Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center font-extrabold text-base overflow-hidden">
                  {viewStudent.photo_url ? (
                    <img src={viewStudent.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    viewStudent.full_name?.[0]?.toUpperCase() || "S"
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">{viewStudent.full_name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-mono font-bold text-brand-600">Roll: {viewStudent.roll_number}</span>
                    <span>•</span>
                    <span>{viewStudent.department}</span>
                    <span>•</span>
                    <span>{viewStudent.year}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => handleToggleActive(viewStudent)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                    viewStudent.is_active !== false
                      ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  {viewStudent.is_active !== false ? "Deactivate Student" : "Reactivate Student"}
                </button>
              </div>
            </div>

            {/* Borrow Records for this student */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Book Loan & Return Records</h4>
              {loadingBorrows ? (
                <div className="py-8 text-center text-slate-400 text-xs animate-pulse">
                  Loading loan records...
                </div>
              ) : studentBorrows.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
                  This student has no borrowing records.
                </div>
              ) : (
                <BorrowTable records={studentBorrows} />
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setViewStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
