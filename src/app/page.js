import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Headphones,
  Library,
  LogIn,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const services = [
    {
      icon: Search,
      title: "Search the Catalogue",
      description: "Find books, authors, and academic resources in seconds.",
      color: "bg-sky-50 text-sky-700",
    },
    {
      icon: BookMarked,
      title: "Reserve Books",
      description: "Reserve available titles online before your next study session.",
      color: "bg-brand-50 text-brand-700",
    },
    {
      icon: CalendarDays,
      title: "Track Borrowing",
      description: "Keep due dates, issued books, returns, and history in view.",
      color: "bg-amber-50 text-amber-700",
    },
    {
      icon: ShieldCheck,
      title: "Student-Friendly Access",
      description: "Sign in with your roll number or institutional email.",
      color: "bg-violet-50 text-violet-700",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main>
        <section id="home" className="relative border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_82%_20%,rgba(220,252,231,0.8),transparent_34%),linear-gradient(to_bottom,#ffffff,#f8fafc)] dark:bg-[radial-gradient(circle_at_82%_20%,rgba(22,163,74,0.15),transparent_34%),linear-gradient(to_bottom,#0f172a,#020617)]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 lg:pt-24 lg:pb-28">
            <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-14 lg:gap-20 items-center">
              <div className="max-w-2xl animate-[fade-up_700ms_ease-out_both]">
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/30 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-brand-800 dark:text-brand-300">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Your academic reading room
                </div>
                <h1 className="mt-6 max-w-xl text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-[4.25rem]">
                  Your Library, <span className="text-brand-700 dark:text-brand-400">Smarter</span> and Simpler.
                </h1>
                <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                  Discover, reserve, and manage your academic resources through Vignandhara Library Management System.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 dark:bg-brand-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/20 dark:shadow-brand-500/20 transition hover:bg-brand-700 dark:hover:bg-brand-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 active:scale-[0.98]">
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    Student Sign In
                  </Link>
                  <Link href="/admin/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm transition hover:border-brand-300 dark:hover:border-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-800 dark:hover:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    Admin Portal
                  </Link>
                  <Link href="/signup" className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-700 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 hover:underline px-3 py-2">
                    New student? Register <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />Easy catalogue access</span>
                  <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />Built for students</span>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-lg animate-[fade-up_800ms_150ms_ease-out_both]" aria-label="Illustration of organized library books" role="img">
                <div className="absolute -right-3 top-2 h-28 w-28 rounded-full border border-brand-200 dark:border-brand-800 bg-brand-100/60 dark:bg-brand-900/30 blur-[1px]" />
                <div className="absolute -left-5 bottom-6 h-20 w-20 rounded-full border border-sky-200 dark:border-sky-800 bg-sky-100/60 dark:bg-sky-900/30" />
                <div className="relative rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-2xl shadow-slate-300/40 dark:shadow-slate-950/60 sm:p-9">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-400">Library shelf</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">A place for every idea</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400"><Library className="h-5 w-5" /></div>
                  </div>
                  <div className="mt-7 flex h-48 items-end justify-center gap-2 border-b-8 border-slate-200 dark:border-slate-700 pb-0 sm:h-56 sm:gap-3">
                    <div className="h-32 w-10 rounded-t-lg bg-sky-700 dark:bg-sky-600 shadow-md sm:w-12"><span className="mt-5 block -rotate-90 text-[10px] font-bold uppercase tracking-widest text-white">Science</span></div>
                    <div className="h-44 w-11 rounded-t-lg bg-brand-700 dark:bg-brand-600 shadow-md sm:w-14"><span className="mt-8 block -rotate-90 text-[10px] font-bold uppercase tracking-widest text-white">Design</span></div>
                    <div className="h-36 w-12 rounded-t-lg bg-amber-500 dark:bg-amber-600 shadow-md sm:w-14"><span className="mt-8 block -rotate-90 text-[10px] font-bold uppercase tracking-widest text-amber-950 dark:text-amber-100">History</span></div>
                    <div className="h-48 w-11 rounded-t-lg bg-slate-800 dark:bg-slate-700 shadow-md sm:w-14"><span className="mt-10 block -rotate-90 text-[10px] font-bold uppercase tracking-widest text-white">Culture</span></div>
                    <div className="h-28 w-10 rounded-t-lg bg-rose-400 dark:bg-rose-500 shadow-md sm:w-12"><span className="mt-5 block -rotate-90 text-[10px] font-bold uppercase tracking-widest text-rose-950 dark:text-rose-100">Arts</span></div>
                  </div>
                  <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-900/50 px-4 py-3">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ready when you are</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 dark:text-brand-400"><span className="h-2 w-2 rounded-full bg-brand-500 dark:bg-brand-400" />Open access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="bg-slate-50 dark:bg-slate-950 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-400">One portal, less friction</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Everything You Need for Better Learning</h2>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">Spend less time managing the details and more time with the resources that move your learning forward.</p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {services.map(({ icon: Icon, title, description, color }) => (
                <article key={title} className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-lg hover:shadow-slate-200/70 dark:hover:shadow-slate-950/70">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color} dark:bg-opacity-20`}><Icon className="h-5 w-5" aria-hidden="true" /></div>
                  <h3 className="mt-5 text-base font-bold text-slate-900 dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-400">About the library</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">A welcoming space for curious minds.</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">Vignandhara Library is a student-centered academic library built to make trusted knowledge easier to discover. Whether you are starting a project, preparing for exams, or following a new interest, your next useful resource is close at hand.</p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 dark:bg-brand-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-700 dark:hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <LogIn className="h-4 w-4" />
                  Student Portal
                </Link>
                <Link href="/admin/login" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <ShieldCheck className="h-4 w-4" />
                  Admin Portal
                </Link>
                <Link href="/signup" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 dark:text-brand-400 hover:underline px-2 py-1">
                  Register <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div id="contact" className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400"><Clock3 className="h-5 w-5" /></div><div><h3 className="font-bold text-slate-900 dark:text-white">Library hours</h3><p className="text-xs text-slate-500 dark:text-slate-400">Plan your next visit</p></div></div>
              <div className="space-y-4 pt-5 text-sm"><div className="flex justify-between gap-4"><span className="text-slate-500 dark:text-slate-400">Monday - Friday</span><span className="font-semibold text-slate-800 dark:text-slate-200">9:00 AM - 5:30 PM</span></div><div className="flex justify-between gap-4"><span className="text-slate-500 dark:text-slate-400">Saturday</span><span className="font-semibold text-slate-800 dark:text-slate-200">9:00 AM - 1:00 PM</span></div></div>
              <div className="mt-6 space-y-3 border-t border-slate-200 dark:border-slate-700 pt-5 text-sm text-slate-600 dark:text-slate-300"><p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-700 dark:text-brand-400" />Main Academic Block, Ground Floor</p><p className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand-700 dark:text-brand-400" /><a href="mailto:vignandharalibrary@gmail.com" className="hover:underline">vignandharalibrary@gmail.com</a></p><p className="flex items-center gap-2"><Headphones className="h-4 w-4 text-brand-700 dark:text-brand-400" /><a href="tel:+9000000009" className="hover:underline">Library desk: +9000000009</a></p></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 dark:bg-slate-950 py-8 text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-semibold text-white"><BookOpen className="h-4 w-4 text-brand-400" />Vignandhara LMS</div>
          <p className="text-xs text-slate-400">© 2026 Vignandhara LMS. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-5 text-xs font-semibold">
            <Link href="/login" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-400">Student Sign In</Link>
            <Link href="/admin/login" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-400">Admin Portal</Link>
            <Link href="/signup" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-400">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
