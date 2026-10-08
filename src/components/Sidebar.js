"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  History,
  User,
  LogOut,
  Library,
  GraduationCap,
  Sparkles,
  BookmarkCheck,
  X
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function Sidebar({ userProfile = null, isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const studentLinks = [
    { name: "My Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { name: "Digital Books / E-Books", href: "/student/digital-books", icon: Sparkles },
    { name: "My Digital Books", href: "/student/my-digital-books", icon: BookmarkCheck },
    { name: "Borrow History", href: "/student/history", icon: History },
    { name: "My Profile", href: "/student/profile", icon: User },
  ];

  const links = studentLinks;

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const navContent = (
    <div className="flex flex-col h-full bg-slate-900 dark:bg-slate-950 text-slate-200 dark:text-slate-300 border-r border-slate-800 dark:border-slate-900">
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-800/80 dark:border-slate-900/80">
        <Link href="/student/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-base text-white tracking-tight flex items-center gap-2">
              Vignandhara LMS
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                student
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">College Library System</p>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 dark:text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Student Services
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => onClose && onClose()}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? "bg-brand-600 dark:bg-brand-500 text-white shadow-sm shadow-brand-600/30 dark:shadow-brand-500/30 font-semibold"
                  : "text-slate-300 dark:text-slate-400 hover:bg-slate-800/80 dark:hover:bg-slate-900/80 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>

      {/* User Info & Logout footer */}
      <div className="p-4 border-t border-slate-800/80 dark:border-slate-900/80 bg-slate-950/40 dark:bg-slate-950/60">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-400 overflow-hidden flex-shrink-0">
            {userProfile?.photo_url ? (
              <img src={userProfile.photo_url} alt={userProfile.full_name} className="w-full h-full object-cover" />
            ) : (
              <GraduationCap className="w-5 h-5 text-brand-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {userProfile?.full_name || "Student User"}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
              {userProfile?.roll_number ? `Roll: ${userProfile.roll_number}` : userProfile?.department || "Student Portal"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-300 dark:text-rose-400 hover:text-rose-100 hover:bg-rose-950/40 dark:hover:bg-rose-950/60 border border-rose-900/30 dark:border-rose-900/50 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
          {loggingOut ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 shadow-xl">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 dark:bg-slate-950 z-10 shadow-2xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
