"use client";

import { Menu, GraduationCap, ChevronRight, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

export default function Header({ onOpenSidebar, title, breadcrumb = [], userProfile = null }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left side: hamburger (mobile) & breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium overflow-hidden">
          <Link href="/student/dashboard" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
            Student
          </Link>
          {breadcrumb.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 flex-shrink-0" />
              <span className={idx === breadcrumb.length - 1 ? "font-semibold text-slate-900 dark:text-white truncate" : "hover:text-brand-600 dark:hover:text-brand-400 truncate"}>
                {crumb}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Quick stats/badge & profile pill */}
      <div className="flex items-center gap-3">
        <button onClick={toggleTheme} type="button" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-brand-700 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500">
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        {userProfile?.roll_number && (
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-400 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Roll: {userProfile.roll_number}</span>
          </div>
        )}

        <Link
          href="/student/profile"
          className="flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
        >
          <div className="w-7 h-7 rounded-full bg-brand-600 dark:bg-brand-500 text-white flex items-center justify-center font-bold text-xs overflow-hidden">
            {userProfile?.photo_url ? (
              <img src={userProfile.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (userProfile?.full_name || "S")[0]?.toUpperCase()
            )}
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden md:block">
            {userProfile?.full_name?.split(" ")[0] || "Profile"}
          </span>
        </Link>
      </div>
    </header>
  );
}
