import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  BookOpen,
  Search,
  ShieldCheck,
  GraduationCap,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Library,
  BookMarked,
  Receipt,
  Layers
} from "lucide-react";

export default function LandingPage() {
  const featuredBooks = [
    {
      title: "Introduction to Algorithms",
      author: "Thomas H. Cormen",
      category: "Computer Science",
      copies: "6 Available",
      cover: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "Artificial Intelligence: A Modern Approach",
      author: "Stuart Russell, Peter Norvig",
      category: "AI & Data Science",
      copies: "5 Available",
      cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "Calculus: Early Transcendentals",
      author: "James Stewart",
      category: "Mathematics",
      copies: "8 Available",
      cover: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "Microelectronic Circuits",
      author: "Adel S. Sedra",
      category: "Electronics",
      copies: "5 Available",
      cover: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=500&auto=format&fit=crop&q=60",
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 bg-gradient-to-b from-white via-brand-50/30 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Next-Generation Central Academic Library</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Empowering Minds Through <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-600">Knowledge & Discovery</span>
            </h1>

            {/* Subtext */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              Search thousands of academic books, reserve study materials, track return due dates, and manage fine settlements with our unified digital library portal.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-base font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/30 transition-all active:scale-[0.98]"
              >
                <GraduationCap className="w-5 h-5" />
                Student Portal Login
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100/80 border border-slate-300 rounded-xl shadow-sm transition active:scale-[0.98]"
              >
                Create Student Account
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Librarian / Admin Sign In
              </Link>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <p className="text-3xl font-extrabold text-brand-700">12,500+</p>
              <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">Books & Monographs</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <p className="text-3xl font-extrabold text-slate-900">14 Days</p>
              <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">Standard Borrow Period</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <p className="text-3xl font-extrabold text-emerald-600">₹5/Day</p>
              <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">Nominal Overdue Rate</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <p className="text-3xl font-extrabold text-indigo-600">100%</p>
              <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">Digital Records</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Catalog Preview */}
      <section id="catalog-preview" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-brand-600">Central Repository</div>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Popular Academic Titles</h2>
              <p className="text-slate-500 text-sm mt-1">Browse recommended course texts available for checkout right now.</p>
            </div>
            <Link
              href="/login"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700"
            >
              Search Full 12,000+ Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBooks.map((book, idx) => (
              <div key={idx} className="group bg-slate-50 rounded-2xl border border-slate-200/90 overflow-hidden hover:shadow-xl transition flex flex-col">
                <div className="aspect-[3/4] relative bg-slate-200 overflow-hidden">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md">
                    {book.category}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                    {book.copies}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{book.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">by {book.author}</p>
                  </div>
                  <Link
                    href="/login"
                    className="mt-4 w-full text-center text-xs font-semibold py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 transition"
                  >
                    Login to Borrow
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">Built For Campus Excellence</h2>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">Everything Students & Librarians Need</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Real-Time Book Catalog</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Filter by subject department, author, and availability. Instantly check available copies before visiting the circulation desk.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Due Date & Overdue Alerts</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Clear visual indicators for active loans with color-coded overdue warnings and automated fine calculation at ₹5/day.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Admin Control Desk</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Librarians can issue books in one click, handle returns, manage book inventory with cover uploads, and clear fine payments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Library Rules / Guidelines */}
      <section id="rules" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl">
            <h2 className="text-2xl font-extrabold flex items-center gap-3">
              <Library className="w-7 h-7 text-brand-400" />
              Circulation Guidelines & Policies
            </h2>
            <p className="text-slate-300 text-sm mt-2">Please review our lending policies to maintain a seamless library experience for all students.</p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-white">Loan Period</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Students may borrow books for a standard period of 14 calendar days.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-white">Overdue Fines</h4>
                  <p className="text-xs text-slate-300 mt-0.5">A nominal charge of ₹5.00 per day is accrued after the due date until returned.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-white">Borrow Quota</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Students can hold up to 3 active books simultaneously across departments.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-white">Digital Library Card</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Present your Roll Number or digital student profile at the circulation desk.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-base">Athena College LMS</span>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} College Central Library. All rights reserved. Powered by Next.js & Supabase.
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <Link href="/login" className="hover:text-white transition">Sign In</Link>
            <Link href="/signup" className="hover:text-white transition">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
