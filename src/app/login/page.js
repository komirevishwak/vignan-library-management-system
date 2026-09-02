"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, LogIn, Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck, GraduationCap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message || "Invalid email or password.");
      }

      if (data?.user) {
        // Fetch user role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, is_active")
          .eq("id", data.user.id)
          .single();

        if (profile && profile.is_active === false) {
          await supabase.auth.signOut();
          throw new Error("Your account has been deactivated by the librarian. Please contact the library desk.");
        }

        const role = profile?.role || "student";
        if (role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/student/dashboard");
        }
        router.refresh();
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || "Unable to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-100/40 via-brand-50/20 to-transparent pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-800 via-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-700/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to Vignandhara LMS
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Sign in to access your library portal & book reservations
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Sign In Failed</p>
                <p className="mt-0.5 text-rose-700">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Email Address
              </label>
              <div className="mt-1.5 relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50/50 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password
                </label>
              </div>
              <div className="mt-1.5 relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50/50 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 shadow-md shadow-brand-600/30 transition disabled:opacity-60 active:scale-[0.99]"
              >
                <LogIn className="w-4 h-4" />
                {loading ? "Authenticating..." : "Sign In to Portal"}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Info */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              Testing & Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setEmail("student@college.edu");
                  setPassword("password123");
                }}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Student Demo</p>
                  <p className="text-[10px] text-slate-500">Auto-fill student</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@college.edu");
                  setPassword("admin123");
                }}
                className="p-2.5 rounded-lg border border-slate-200 bg-purple-50 hover:bg-purple-100 text-left transition flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-purple-900">Admin Demo</p>
                  <p className="text-[10px] text-purple-600">Auto-fill admin</p>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Don&apos;t have a student account yet?{" "}
              <Link href="/signup" className="font-bold text-brand-600 hover:text-brand-700">
                Register here
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1">
            ← Back to Public Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
