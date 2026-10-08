"use client";

import { Menu, Bell, BookOpen, Shield, GraduationCap, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Header({ onOpenSidebar, title, breadcrumb = [], role = "student", userProfile = null }) {
  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left side: hamburger (mobile) & breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium overflow-hidden">
          <Link href={role === "admin" ? "/admin/dashboard" : "/student/dashboard"} className="hover:text-brand-600 transition">
            {role === "admin" ? "Admin" : "Student"}
          </Link>
          {breadcrumb.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className={idx === breadcrumb.length - 1 ? "font-semibold text-slate-900 truncate" : "hover:text-brand-600 truncate"}>
                {crumb}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Quick stats/badge & profile pill */}
      <div className="flex items-center gap-3">
        {role === "student" && userProfile?.roll_number && (
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5 text-brand-600" />
            <span>Roll: {userProfile.roll_number}</span>
          </div>
        )}

        {role === "admin" && (
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span>Administrator</span>
          </div>
        )}

        <Link
          href={role === "admin" ? "/admin/profile" : "/student/profile"}
          className="flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-full hover:bg-slate-100 border border-slate-200 transition"
        >
          <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs overflow-hidden">
            {userProfile?.photo_url ? (
              <img src={userProfile.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (userProfile?.full_name || (role === "admin" ? "A" : "S"))[0]?.toUpperCase()
            )}
          </div>
          <span className="text-xs font-semibold text-slate-800 hidden md:block">
            {userProfile?.full_name?.split(" ")[0] || (role === "admin" ? "Admin Profile" : "Profile")}
          </span>
        </Link>
      </div>
    </header>
  );
}
