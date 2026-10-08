"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DEPARTMENTS, STUDY_YEARS } from "@/lib/utils";
import {
  BookOpen,
  UserPlus,
  Lock,
  Mail,
  User,
  Phone,
  Hash,
  Building,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  Inbox,
  ShieldCheck
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    rollNumber: "",
    department: DEPARTMENTS[0],
    year: STUDY_YEARS[0],
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: formData.email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (resendError) throw resendError;
      startResendCooldown();
    } catch (err) {
      console.error("Resend error:", err);
    } finally {
      setResendLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanRoll = formData.rollNumber.trim().toUpperCase();
    const cleanEmail = formData.email.trim().toLowerCase();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // 1. Check if roll number already exists in database
      const { data: existingRoll } = await supabase
        .from("profiles")
        .select("id, roll_number")
        .ilike("roll_number", cleanRoll)
        .maybeSingle();

      if (existingRoll) {
        throw new Error(
          `Roll Number "${cleanRoll}" is already registered. Please sign in or contact the library administrator.`
        );
      }

      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;

      // 2. Sign up with Supabase Auth including complete metadata & email redirect
      const { data, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.fullName.trim(),
            roll_number: cleanRoll,
            department: formData.department,
            year: formData.year,
            phone: formData.phone.trim(),
            email: cleanEmail,
            role: "student",
          },
        },
      });

      if (authError) {
        throw new Error(authError.message || "Failed to create account.");
      }

      // 3. If user created, attempt profile upsert immediately
      if (data?.user) {
        try {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            email: cleanEmail,
            full_name: formData.fullName.trim(),
            roll_number: cleanRoll,
            department: formData.department,
            year: formData.year,
            phone: formData.phone.trim(),
            role: "student",
            is_active: true,
          });
        } catch (profileErr) {
          console.warn("Client profile upsert note:", profileErr);
        }

        // 4. Call welcome email API (sends styled welcome email details)
        try {
          await fetch("/api/send-welcome-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: data.user.id,
              fullName: formData.fullName.trim(),
              rollNumber: cleanRoll,
              email: cleanEmail,
              department: formData.department,
              year: formData.year,
            }),
          });
        } catch (emailErr) {
          // Non-critical: do not block signup flow
          console.warn("Welcome email API call note:", emailErr);
        }

        // If session is null, Supabase requires email verification
        if (!data.session) {
          setVerificationSent(true);
          startResendCooldown();
        } else {
          // Email confirmation is disabled — direct login
          setSuccess(true);
          setTimeout(() => {
            router.push("/student/dashboard");
            router.refresh();
          }, 1200);
        }
      }
    } catch (err) {
      console.error("Signup failed:", err);
      setError(
        err.message || "An error occurred during registration. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-100/40 via-brand-50/20 to-transparent pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-800 via-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-brand-700/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Registration
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Create your digital library account with your institutional roll number
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200 sm:px-10">
          {/* ── Verification Sent State ── */}
          {verificationSent ? (
            <div className="text-center py-4 space-y-5">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-brand-50 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-inner">
                <Inbox className="w-10 h-10 text-emerald-600" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Verification Email Sent!</h3>
                <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                  We sent a confirmation link to{" "}
                  <span className="font-bold text-slate-900">{formData.email}</span>.
                  <br />
                  Please check your inbox (and spam folder) and click the link to activate your account.
                </p>
              </div>

              {/* Steps */}
              <div className="text-left bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Next Steps</p>
                {[
                  { step: "1", text: `Open the email sent to ${formData.email}` },
                  { step: "2", text: "Click \"Confirm your email\" in the email" },
                  { step: "3", text: "You'll be redirected to the login page automatically" },
                  { step: "4", text: "Sign in with your email and password" },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {step}
                    </div>
                    <p className="text-xs text-slate-600">{text}</p>
                  </div>
                ))}
              </div>

              {/* Resend Button */}
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || resendLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition"
                >
                  <RefreshCw className={`w-4 h-4 ${resendLoading ? "animate-spin" : ""}`} />
                  {resendLoading
                    ? "Resending..."
                    : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend Verification Email"}
                </button>
                <Link
                  href="/login"
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 transition text-center shadow-md shadow-brand-600/30"
                >
                  Proceed to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* ── Error Banner ── */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Registration Failed</p>
                    <p className="mt-0.5 text-rose-700">{error}</p>
                  </div>
                </div>
              )}

              {/* ── Success Banner ── */}
              {success && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Registration Successful!</p>
                    <p className="text-emerald-700">Redirecting to your student dashboard...</p>
                  </div>
                </div>
              )}

              {/* ── Registration Form ── */}
              <form className="space-y-4" onSubmit={handleSignup}>
                {/* Full Name & Roll Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Full Name *
                    </label>
                    <div className="mt-1 relative rounded-xl">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Ravi Kumar"
                        className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Roll Number *
                    </label>
                    <div className="mt-1 relative rounded-xl">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Hash className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        name="rollNumber"
                        required
                        value={formData.rollNumber}
                        onChange={handleChange}
                        placeholder="e.g. 21CS042"
                        className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50/50 uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Department & Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Department *
                    </label>
                    <div className="mt-1 relative rounded-xl">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Building className="h-4 w-4" />
                      </div>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Year of Study *
                    </label>
                    <div className="mt-1 relative rounded-xl">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        {STUDY_YEARS.map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Phone Number
                    </label>
                    <div className="mt-1 relative rounded-xl">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Email Address *
                    </label>
                    <div className="mt-1 relative rounded-xl">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="student@college.edu"
                        className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Password *
                    </label>
                    <div className="mt-1 relative rounded-xl">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min. 6 characters"
                        className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Confirm Password *
                    </label>
                    <div className="mt-1 relative rounded-xl">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                        className={`block w-full pl-10 pr-3.5 py-2.5 border rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition ${
                          formData.confirmPassword && formData.password !== formData.confirmPassword
                            ? "border-rose-400 focus:ring-rose-400"
                            : formData.confirmPassword && formData.password === formData.confirmPassword
                            ? "border-emerald-400 focus:ring-emerald-400"
                            : "border-slate-300 focus:ring-brand-500"
                        }`}
                      />
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">Passwords do not match</p>
                    )}
                  </div>
                </div>

                {/* Info notice about email verification */}
                <div className="flex items-start gap-2.5 p-3 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-800">
                  <ShieldCheck className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                  <p>
                    After registration, a <strong>verification email</strong> will be sent to your address.
                    You must confirm it before you can log in.
                  </p>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading || success}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 shadow-md shadow-brand-600/30 transition disabled:opacity-60 active:scale-[0.99]"
                  >
                    <UserPlus className="w-4 h-4" />
                    {loading ? "Creating Account..." : "Create Student Account"}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-slate-500">
                  Already have an account?{" "}
                  <Link href="/login" className="font-bold text-brand-600 hover:text-brand-700">
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
