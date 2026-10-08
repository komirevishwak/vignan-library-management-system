import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const user = data.user;
      const meta = user.user_metadata || {};

      // Ensure profile row exists in public.profiles upon email verification
      try {
        await supabase.from("profiles").upsert(
          {
            id: user.id,
            email: user.email,
            full_name: meta.full_name || "Student User",
            roll_number: meta.roll_number || null,
            department: meta.department || "Computer Science & Engineering",
            year: meta.year || "1st Year",
            phone: meta.phone || null,
            role: meta.role || "student",
            photo_url: meta.photo_url || null,
            is_active: true,
          },
          { onConflict: "id" }
        );
      } catch (upsertErr) {
        console.error("Error auto-provisioning profile in auth callback:", upsertErr);
      }

      // If a specific next URL was requested, honour it
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      // Route by role: admin → admin dashboard, student → login with confirmed banner
      // We redirect students to /login?confirmed=true so they see the success banner
      // and then log in fresh (better UX than auto-login from a verification link).
      const role = meta.role || "student";

      if (role === "admin") {
        return NextResponse.redirect(`${origin}/admin/dashboard`);
      }

      // Redirect confirmed students to login page with a success banner
      return NextResponse.redirect(`${origin}/login?confirmed=true`);
    }
  }

  // If code exchange failed or no code, redirect to login with confirmed hint
  return NextResponse.redirect(`${origin}/login?confirmed=true`);
}
