"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, LogIn, Lock, Mail, AlertCircle, Eye, EyeOff, ShieldCheck, Hash } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("confirmed") === "true") {
        setInfoMessage("Email confirmed successfully! You can now log in with your credentials.");
      }
      if (urlParams.get("error") === "account-inactive") {
        setError("Your account has been deactivated by the librarian. Please contact the library desk.");
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      let emailToAuth = identifier.trim();

      // If user provided a Roll Number (no '@' sign), resolve email from profiles
      if (!emailToAuth.includes("@")) {
        const cleanRoll = emailToAuth.toUpperCase();
        const { data: matchedProfile } = await supabase
          .from("profiles")
          .select("id, roll_number, email, role")
          .ilike("roll_number", cleanRoll)
          .maybeSingle();

        if (matchedProfile && matchedProfile.email) {
          emailToAuth = matchedProfile.email;
        } else {
          emailToAuth = `${cleanRoll.toLowerCase()}@college.edu`;
        }
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: emailToAuth,
        password,
      });

      if (authError) {
        throw new Error(authError.message || "Invalid Roll Number / Email or password.");
      }

      if (data?.user) {
        const user = data.user;
        const meta = user.user_metadata || {};

        // Admin access is controlled by the dedicated allowlist table.
        const { data: adminAccount } = await supabase
          .from("admin_accounts")
          .select("is_active")
          .eq("id", user.id)
          .maybeSingle();

        if (adminAccount?.is_active) {
          router.push("/admin/dashboard");
          router.refresh();
          return;
        }

        // Fetch student role and active status safely with maybeSingle()
        let { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        // If profile row doesn't exist yet (e.g. email confirmation bypassed trigger), auto-provision it immediately
        if (!profile) {
          const newProfile = {
            id: user.id,
            email: user.email,
            full_name: meta.full_name || (emailToAuth.includes("@") ? emailToAuth.split("@")[0] : identifier),
            roll_number: meta.roll_number || (!identifier.includes("@") ? identifier.toUpperCase() : null),
            department: meta.department || "Computer Science & Engineering",
            year: meta.year || "1st Year",
            phone: meta.phone || null,
            role: meta.role || (emailToAuth.includes("admin") ? "admin" : "student"),
            is_active: true,
          };

          try {
            await supabase.from("profiles").upsert(newProfile);
            profile = newProfile;
          } catch (pErr) {
            console.warn("Auto-provision profile warning:", pErr);
            profile = newProfile;
          }
        }

        if (profile && profile.is_active === false) {
          await supabase.auth.signOut();
          throw new Error("Your account has been deactivated by the librarian. Please contact the library desk.");
        }

        router.push("/student/dashboard");
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
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-100/40 via-brand-50/20 to-transparent dark:from-brand-900/20 dark:via-brand-950/10 dark:to-transparent pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-800 via-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-brand-700/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome to Vignandhara LMS
          </h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Sign in to access your library portal & book reservations
          </p>
        </div>

        <div className="mt-8 bg-white dark:bg-slate-900 py-8 px-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 sm:px-10">
          {infoMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Email Verified</p>
                <p className="mt-0.5 text-emerald-700 dark:text-emerald-300">{infoMessage}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Sign In Failed</p>
                <p className="mt-0.5 text-rose-700 dark:text-rose-300">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Roll Number or Institutional Email
              </label>
              <div className="mt-1.5 relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Hash className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 21CS042 or student@college.edu"
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition uppercase"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition">
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1.5 relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 shadow-md shadow-brand-600/30 dark:shadow-brand-500/30 transition disabled:opacity-60 active:scale-[0.99]"
              >
                <LogIn className="w-4 h-4" />
                {loading ? "Authenticating..." : "Sign In to Portal"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don&apos;t have a student account yet?{" "}
              <Link href="/signup" className="font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">
                Register here
              </Link>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Librarian or staff member?{" "}
              <Link href="/admin/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 underline">
                Sign in to Admin Portal →
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium inline-flex items-center gap-1">
            ← Back to Public Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
