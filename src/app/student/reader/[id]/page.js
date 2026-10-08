"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Clock,
  ArrowLeft,
  RotateCcw,
  AlertCircle,
  ShieldCheck,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Layers,
  FileText,
  Sparkles
} from "lucide-react";

export default function DigitalReaderPage({ params }) {
  const router = useRouter();
  const { id: borrowingId } = params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowing, setBorrowing] = useState(null);
  const [returning, setReturning] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);

  useEffect(() => {
    async function verifyBorrowing() {
      try {
        setLoading(true);
        setError(null);

        // Verify active borrow status
        const activeRes = await fetch("/api/digital-borrowings/my-active");
        if (!activeRes.ok) {
          throw new Error("Unable to verify digital loans. Please log in again.");
        }

        const activeData = await activeRes.json();
        const matched = (activeData.active_borrows || []).find(
          (b) => b.id === borrowingId
        );

        if (!matched) {
          setError(
            "This digital book access has expired or does not belong to your active loans."
          );
          setLoading(false);
          return;
        }

        setBorrowing(matched);
        setPdfReady(true);
      } catch (err) {
        console.error("Reader verification error:", err);
        setError(err.message || "Failed to load reader session.");
      } finally {
        setLoading(false);
      }
    }

    if (borrowingId) {
      verifyBorrowing();
    }
  }, [borrowingId]);

  const handleReturnEarly = async () => {
    if (!confirm("Are you sure you want to end reading and return this book early?")) {
      return;
    }

    try {
      setReturning(true);
      const res = await fetch(`/api/digital-borrowings/${borrowingId}/return`, {
        method: "POST",
      });

      if (res.ok) {
        router.push("/student/my-digital-books");
      } else {
        const d = await res.json();
        alert(d.error || "Failed to return book.");
      }
    } catch (err) {
      console.error("Return error:", err);
      alert("An error occurred while ending access.");
    } finally {
      setReturning(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setFullscreen(false);
    }
  };

  const pdfStreamUrl = `/api/digital-borrowings/${borrowingId}/read#toolbar=1&navpanes=1&statusbar=1`;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-12 h-12 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin mb-4" />
        <h2 className="text-lg font-bold">Initializing Secure Digital Reader...</h2>
        <p className="text-xs text-slate-400 mt-1">
          Verifying 14-day student access credentials
        </p>
      </div>
    );
  }

  if (error || !borrowing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Access Unavailable</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {error || "Your 14-day access to this digital book has expired or is invalid."}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/student/my-digital-books"
              className="py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-md shadow-brand-600/20 transition"
            >
              Go to My Digital Books
            </Link>
            <Link
              href="/student/digital-books"
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
            >
              Browse Digital Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const book = borrowing.book || {};
  const daysRemaining = borrowing.days_remaining ?? 14;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden text-slate-100">
      {/* Top Reader Navigation Bar */}
      <header className="h-16 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 shadow-lg">
        {/* Left: Back Link & Book Details */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/student/my-digital-books"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Back to My Digital Books"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-white truncate leading-tight">
              {book.title}
            </h1>
            <p className="text-[11px] text-slate-400 truncate">
              {book.author} • {book.category}
            </p>
          </div>
        </div>

        {/* Center/Right: Due Countdown & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Due Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{daysRemaining} Days Left</span>
          </div>

          {/* Zoom controls */}
          <div className="hidden md:flex items-center gap-1 bg-slate-800/80 rounded-xl p-1 border border-slate-700/50">
            <button
              onClick={() => setZoom((z) => Math.max(75, z - 15))}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 text-xs"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-1 text-slate-300">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(150, z + 15))}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 text-xs"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={fullscreen ? "Exit full screen" : "Full screen"}
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* End Reading / Early Return */}
          <button
            onClick={handleReturnEarly}
            disabled={returning}
            className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700/50 text-xs font-bold transition flex items-center gap-1.5"
            title="End reading and release this book slot"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">End Reading</span>
          </button>
        </div>
      </header>

      {/* Main Document Viewer Container */}
      <main className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center">
        {pdfReady && (
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-200"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          >
            <object
              data={pdfStreamUrl}
              type="application/pdf"
              className="w-full h-full border-none shadow-2xl"
            >
              {/* Fallback in case browser doesn't natively render PDF objects */}
              <iframe
                src={pdfStreamUrl}
                title={book.title || "Digital Book"}
                className="w-full h-full border-none"
              >
                <div className="p-8 text-center text-slate-300 space-y-4">
                  <BookOpen className="w-12 h-12 mx-auto text-emerald-400" />
                  <p className="text-sm">
                    Your browser does not support embedded PDF streaming.
                  </p>
                  <a
                    href={pdfStreamUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block py-2.5 px-5 rounded-xl bg-brand-600 text-white font-bold text-sm"
                  >
                    Open PDF in Dedicated Window
                  </a>
                </div>
              </iframe>
            </object>
          </div>
        )}
      </main>

      {/* Security & Access Footer Bar */}
      <footer className="h-8 bg-slate-900 border-t border-slate-800/80 px-4 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Authorized Student Session • 14-Day Digital Loan
        </span>
        <span className="hidden sm:inline text-slate-400">
          Vignandhara LMS Secure e-Book Delivery
        </span>
      </footer>
    </div>
  );
}
