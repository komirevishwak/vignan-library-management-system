"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, LogIn, UserPlus, Menu, X, Library } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-900 via-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-900/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                Athena <span className="text-brand-600 font-semibold text-xs px-2 py-0.5 rounded-full bg-brand-50 border border-brand-200">LMS</span>
              </span>
              <p className="text-[11px] text-slate-500 font-medium">College Library Portal</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
              Features
            </Link>
            <Link href="/#catalog-preview" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
              Book Catalog
            </Link>
            <Link href="/#rules" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
              Library Rules
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-100/80 rounded-lg transition"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-600/30 hover:shadow-md transition active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4" />
              Student Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <Link
            href="/#features"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Features
          </Link>
          <Link
            href="/#catalog-preview"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Book Catalog
          </Link>
          <Link
            href="/#rules"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Library Rules
          </Link>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-brand-600 rounded-lg shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              Student Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
