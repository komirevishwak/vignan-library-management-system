"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEPARTMENTS, STUDY_YEARS, formatDate } from "@/lib/utils";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";
import BorrowTable from "@/components/BorrowTable";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Eye,
  Edit2,
  Trash2,
  UserPlus,
  Download,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Hash,
  User,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  RefreshCw
} from "lucide-react";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All"); // 'All' | 'Active' | 'Deactivated'
  const [loading, setLoading] = useState(true);

  // Modal States
  const [viewStudent, setViewStudent] = useState(null);
  const [studentBorrows, setStudentBorrows] = useState([]);
  const [loadingBorrows, setLoadingBorrows] = useState(false);

  // Add / Edit Modal State
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null); // null = Add mode, object = Edit mode
  const [formData, setFormData] = useState({
    fullName: "",
    rollNumber: "",
    department: DEPARTMENTS[0],
    year: STUDY_YEARS[0],
    email: "",
    phone: "",
    isActive: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete Modal State
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Alert banner
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadStudents = useCallback(async () => {
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
    } catch (err) {
      console.error("Error loading students:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();

    // Supabase Realtime subscription for profiles table
    const supabase = createClient();
    const channel = supabase
      .channel("admin_students_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          loadStudents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadStudents]);

  // Filter effect
  useEffect(() => {
    let list = [...students];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.full_name?.toLowerCase().includes(q) ||
          s.roll_number?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.department?.toLowerCase().includes(q) ||
          s.phone?.includes(q)
      );
    }

    if (selectedDept !== "All") {
      list = list.filter((s) => s.department === selectedDept);
    }

    if (selectedYear !== "All") {
      list = list.filter((s) => s.year === selectedYear);
    }

    if (statusFilter === "Active") {
      list = list.filter((s) => s.is_active !== false);
    } else if (statusFilter === "Deactivated") {
      list = list.filter((s) => s.is_active === false);
    }

    setFilteredStudents(list);
  }, [searchQuery, selectedDept, selectedYear, statusFilter, students]);

  // Open Add Student Modal
  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      fullName: "",
      rollNumber: "",
      department: DEPARTMENTS[0],
      year: STUDY_YEARS[0],
      email: "",
      phone: "",
      isActive: true,
    });
    setFormError(null);
    setIsAddEditOpen(true);
  };

  // Open Edit Student Modal
  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.full_name || "",
      rollNumber: student.roll_number || "",
      department: student.department || DEPARTMENTS[0],
      year: student.year || STUDY_YEARS[0],
      email: student.email || "",
      phone: student.phone || "",
      isActive: student.is_active !== false,
    });
    setFormError(null);
    setIsAddEditOpen(true);
  };

  // Submit Add or Edit Student into Database
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setFormError(null);

    const cleanRoll = formData.rollNumber.trim().toUpperCase();
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanName = formData.fullName.trim();

    if (!cleanName || !cleanRoll) {
      setFormError("Full Name and Roll Number are required.");
      return;
    }

    setFormLoading(true);

    try {
      const supabase = createClient();

      if (editingStudent) {
        // Edit Mode: Update existing profile in public.profiles
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            full_name: cleanName,
            roll_number: cleanRoll,
            department: formData.department,
            year: formData.year,
            email: cleanEmail || null,
            phone: formData.phone.trim() || null,
            is_active: formData.isActive,
          })
          .eq("id", editingStudent.id);

        if (updateError) throw updateError;

        showFeedback("success", `Student profile for ${cleanName} (${cleanRoll}) updated successfully in database.`);
      } else {
        // Add Mode: Insert new profile in public.profiles
        // First check for duplicate roll number
        const { data: existingRoll } = await supabase
          .from("profiles")
          .select("id, roll_number")
          .ilike("roll_number", cleanRoll)
          .maybeSingle();

        if (existingRoll) {
          throw new Error(`Roll Number "${cleanRoll}" is already registered to another student.`);
        }

        const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : undefined;

        const insertPayload = {
          full_name: cleanName,
          roll_number: cleanRoll,
          department: formData.department,
          year: formData.year,
          email: cleanEmail || `${cleanRoll.toLowerCase()}@college.edu`,
          phone: formData.phone.trim() || null,
          role: "student",
          is_active: formData.isActive,
        };

        if (newId) {
          insertPayload.id = newId;
        }

        const { error: insertError } = await supabase
          .from("profiles")
          .insert([insertPayload]);

        if (insertError) throw insertError;

        showFeedback("success", `New student ${cleanName} (${cleanRoll}) registered and saved into database.`);
      }

      setIsAddEditOpen(false);
      await loadStudents();
    } catch (err) {
      console.error("Save student error:", err);
      setFormError(err.message || "Failed to save student details in database.");
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Student from Database
  const handleDeleteStudent = async () => {
    if (!deletingStudent) return;
    setDeleteLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", deletingStudent.id);

      if (error) throw error;

      showFeedback("success", `Student record for ${deletingStudent.full_name} (${deletingStudent.roll_number}) removed from database.`);
      setDeletingStudent(null);
      await loadStudents();
    } catch (err) {
      console.error("Delete student error:", err);
      alert(err.message || "Failed to delete student record.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (student) => {
    const newStatus = !student.is_active;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: newStatus })
        .eq("id", student.id);

      if (error) throw error;

      showFeedback(
        "success",
        `Account for ${student.full_name} is now ${newStatus ? "Active" : "Deactivated"}.`
      );
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, is_active: newStatus } : s))
      );

      if (viewStudent && viewStudent.id === student.id) {
        setViewStudent((prev) => ({ ...prev, is_active: newStatus }));
      }
    } catch (err) {
      console.error("Status update error:", err);
      showFeedback("error", err.message || "Failed to update account status.");
    }
  };

  // Toggle Admin Role
  const handleToggleRole = async (student) => {
    const newRole = student.role === "admin" ? "student" : "admin";
    const action = newRole === "admin" ? "grant admin privileges to" : "revoke admin privileges from";

    if (!confirm(`Are you sure you want to ${action} ${student.full_name}? This will change their login access level.`)) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", student.id);

      if (error) throw error;

      showFeedback(
        newRole === "admin" ? "success" : "error",
        newRole === "admin"
          ? `${student.full_name} has been granted Admin access.`
          : `Admin privileges revoked from ${student.full_name}.`
      );
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, role: newRole } : s))
      );
    } catch (err) {
      console.error("Role update error:", err);
      showFeedback("error", err.message || "Failed to update user role.");
    }
  };

  // View Student Loans Modal
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

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) {
      alert("No student records available to export.");
      return;
    }

    const headers = ["Roll Number", "Full Name", "Department", "Year", "Email", "Phone", "Status", "Registered Date"];
    const rows = filteredStudents.map((s) => [
      `"${s.roll_number || ""}"`,
      `"${s.full_name || ""}"`,
      `"${s.department || ""}"`,
      `"${s.year || ""}"`,
      `"${s.email || ""}"`,
      `"${s.phone || ""}"`,
      `"${s.is_active !== false ? "Active" : "Deactivated"}"`,
      `"${s.created_at ? new Date(s.created_at).toLocaleDateString() : ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `students_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeCount = students.filter((s) => s.is_active !== false).length;
  const deactivatedCount = students.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Database & Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage institutional student records, branch enrollments, borrowing privileges, and live status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition"
            title="Export filtered student list to CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-xs font-bold text-white shadow-md shadow-brand-600/30 transition active:scale-[0.99]"
          >
            <UserPlus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-3 border transition-all animate-fadeIn ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Directory Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Total Enrolled</span>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">{students.length}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold uppercase text-emerald-600">Active Borrowers</span>
          <p className="text-xl font-extrabold text-emerald-700 mt-0.5">{activeCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold uppercase text-rose-500">Deactivated</span>
          <p className="text-xl font-extrabold text-rose-700 mt-0.5">{deactivatedCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold uppercase text-brand-600">Filtered Results</span>
          <p className="text-xl font-extrabold text-brand-700 mt-0.5">{filteredStudents.length}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="sm:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, roll number, email, phone..."
              className="block w-full pl-10 pr-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Department Filter */}
          <div className="sm:col-span-3">
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

          {/* Year Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All Years</option>
              {STUDY_YEARS.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Deactivated">Deactivated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm animate-pulse bg-white rounded-2xl border border-slate-200">
          Loading student database records...
        </div>
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Student Records Found"
          description={
            searchQuery || selectedDept !== "All" || selectedYear !== "All" || statusFilter !== "All"
              ? "No student matches the specified filter criteria."
              : "No students exist in the database yet. Click 'Add Student' above to register the first student."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Student Details</th>
                <th className="px-5 py-3.5">Roll Number</th>
                <th className="px-5 py-3.5">Department & Year</th>
                <th className="px-5 py-3.5">Contact Details</th>
                <th className="px-5 py-3.5">Status & Role</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-xs text-brand-700 bg-brand-50">
                        {student.photo_url ? (
                          <img src={student.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          student.full_name?.[0]?.toUpperCase() || "S"
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{student.full_name}</p>
                        <span className="text-[10px] text-slate-400">
                          Joined: {student.created_at ? new Date(student.created_at).toLocaleDateString() : "Active"}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 font-mono font-bold text-xs text-brand-700">
                    {student.roll_number || "N/A"}
                  </td>

                  <td className="px-5 py-4 text-xs">
                    <p className="text-slate-800 font-medium">{student.department || "General"}</p>
                    <p className="text-slate-400 text-[11px]">{student.year || "N/A"}</p>
                  </td>

                  <td className="px-5 py-4 text-xs">
                    {student.email && (
                      <p className="text-slate-700 truncate max-w-[180px]" title={student.email}>
                        {student.email}
                      </p>
                    )}
                    {student.phone ? (
                      <p className="text-slate-400 text-[11px] font-mono">{student.phone}</p>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold w-fit ${
                          student.is_active !== false
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {student.is_active !== false ? "Active" : "Deactivated"}
                      </span>
                      {student.role === "admin" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold w-fit bg-purple-50 text-purple-700 border border-purple-200">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                      <button
                        onClick={() => handleOpenStudentDetails(student)}
                        className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 transition"
                        title="View Borrowing History"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(student)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition"
                        title="Edit Student Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleActive(student)}
                        className={`p-1.5 rounded-lg transition ${
                          student.is_active !== false
                            ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={student.is_active !== false ? "Deactivate Student Privileges" : "Reactivate Student Privileges"}
                      >
                        {student.is_active !== false ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                        )}
                      </button>

                      <button
                        onClick={() => handleToggleRole(student)}
                        className={`p-1.5 rounded-lg transition ${
                          student.role === "admin"
                            ? "text-purple-600 hover:bg-purple-50"
                            : "text-slate-400 hover:text-purple-600 hover:bg-purple-50"
                        }`}
                        title={student.role === "admin" ? "Revoke Admin Access" : "Grant Admin Access"}
                      >
                        {student.role === "admin" ? (
                          <ShieldOff className="w-4 h-4" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => setDeletingStudent(student)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Student from Database"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => !formLoading && setIsAddEditOpen(false)}
        title={editingStudent ? "Edit Student Details in Database" : "Add New Student to Database"}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Full Name *
              </label>
              <div className="mt-1 relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="block w-full pl-9 pr-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Roll Number *
              </label>
              <div className="mt-1 relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Hash className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  placeholder="e.g. 23CS105"
                  className="block w-full pl-9 pr-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 uppercase font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Department *
              </label>
              <div className="mt-1 relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building className="h-4 w-4" />
                </div>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="block w-full pl-9 pr-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Year of Study *
              </label>
              <div className="mt-1 relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="block w-full pl-9 pr-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {STUDY_YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Email Address
              </label>
              <div className="mt-1 relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@college.edu"
                  className="block w-full pl-9 pr-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Phone Number
              </label>
              <div className="mt-1 relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="block w-full pl-9 pr-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
              Account Active & Eligible to Borrow
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddEditOpen(false)}
                disabled={formLoading}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-xs font-bold text-white shadow-md shadow-brand-600/30 transition disabled:opacity-60"
              >
                {formLoading ? "Saving to Database..." : editingStudent ? "Update Student" : "Save Student"}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingStudent}
        onClose={() => !deleteLoading && setDeletingStudent(null)}
        title="Confirm Student Record Deletion"
        maxWidth="max-w-md"
      >
        {deletingStudent && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Permanent Database Deletion</p>
                <p className="mt-1 text-rose-700">
                  Are you sure you want to delete <span className="font-bold">{deletingStudent.full_name}</span> (Roll: <span className="font-mono font-bold">{deletingStudent.roll_number}</span>)?
                  This action will permanently delete their account record and related loans.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStudent}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md shadow-rose-600/30 transition disabled:opacity-60"
              >
                {deleteLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Student Details & Loans Modal */}
      <Modal
        isOpen={!!viewStudent}
        onClose={() => setViewStudent(null)}
        title="Student Profile & Borrow Records"
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
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-mono font-bold text-brand-600">Roll: {viewStudent.roll_number}</span>
                    <span>•</span>
                    <span>{viewStudent.department}</span>
                    <span>•</span>
                    <span>{viewStudent.year}</span>
                  </div>
                  {viewStudent.email && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {viewStudent.email}
                    </p>
                  )}
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
                  {viewStudent.is_active !== false ? "Deactivate Account" : "Reactivate Account"}
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
