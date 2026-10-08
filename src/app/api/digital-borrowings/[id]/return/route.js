import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/digital-borrowings/:id/return
 * Early return of an active digital book loan.
 * Frees up 1 of the student's 2 borrowing slots immediately.
 */
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // 1. Fetch borrowing
    const { data: borrowing, error: fetchError } = await supabase
      .from("digital_borrowings")
      .select("id, student_id, status")
      .eq("id", id)
      .maybeSingle();

    if (!borrowing) {
      return NextResponse.json({ error: "Borrowing record not found." }, { status: 404 });
    }

    // 2. Authorization check
    if (borrowing.student_id !== user.id) {
      return NextResponse.json({ error: "Access denied. You do not own this borrowing." }, { status: 403 });
    }

    // 3. Status check
    if (borrowing.status !== "active") {
      return NextResponse.json({ error: "This borrowing is already returned or expired." }, { status: 400 });
    }

    // 4. Update status to 'returned'
    const nowIso = new Date().toISOString();
    const { data: updated, error: updateError } = await supabase
      .from("digital_borrowings")
      .update({
        status: "returned",
        returned_at: nowIso,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: "Digital book returned successfully. Slot is now free for new borrows.",
      borrowing: updated,
    });
  } catch (err) {
    console.error("POST /api/digital-borrowings/:id/return error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to return digital book." },
      { status: 500 }
    );
  }
}
