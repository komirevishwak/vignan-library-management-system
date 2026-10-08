import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST /api/sync-overdue
 * Updates all borrow_records that are past their due_date and still 'issued'
 * to status='overdue'. Called by the admin dashboard on load.
 * Protected: only callable by authenticated admins.
 */
export async function POST(request) {
  try {
    const supabase = createClient();

    // Verify caller is an authenticated admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // Update all 'issued' records where due_date is in the past → set to 'overdue'
    const now = new Date().toISOString();

    const { data: updated, error: updateError } = await supabase
      .from("borrow_records")
      .update({ status: "overdue" })
      .eq("status", "issued")
      .lt("due_date", now)
      .select("id");

    if (updateError) {
      console.error("Overdue sync error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const count = updated?.length || 0;

    return NextResponse.json({
      success: true,
      updatedCount: count,
      message: count > 0
        ? `${count} record(s) marked as overdue.`
        : "No new overdue records found.",
    });
  } catch (err) {
    console.error("Sync overdue API error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
