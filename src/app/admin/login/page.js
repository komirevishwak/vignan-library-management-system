"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, KeyRound, Library, LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const message = new URLSearchParams(window.location.search).get("error");
    if (message === "not-authorized") {
      setError("This account is not authorized for the administration portal.");
    }
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) throw authError;

      // Authorization is separate from password authentication: only allowlisted Auth users may enter.
      const { data: adminAccount, error: accountError } = await supabase
        .from("admin_accounts")
        .select("id, is_active")
        .eq("id", data.user.id)
        .maybeSingle();

      if (accountError || !adminAccount?.is_active) {
        await supabase.auth.signOut();
        throw new Error("This account is not authorized for the administration portal.");
      }

      router.replace("/admin/dashboard");
      router.refresh();
    } catch (loginError) {
      setError(loginError.message || "Unable to sign in to the administration portal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center text-white mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-900/40">
            <Library className="w-7 h-7" />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight">Library Administration</h1>
          <p className="mt-2 text-sm text-slate-400">Authorized staff access only</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Admin Email</label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              placeholder="librarian@college.edu"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Password</label>
            <div className="relative mt-1.5">
              <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold transition disabled:opacity-60"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Authenticating..." : "Sign In to Admin Portal"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-slate-400">
            Looking for student access?{" "}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-semibold underline">
              Student Sign In Portal →
            </Link>
          </p>
          <p>
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition">
              ← Back to Public Homepage
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
