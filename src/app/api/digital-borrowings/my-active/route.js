import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateDigitalLoanRemaining } from "@/lib/digital-books-data";
/**
 * GET /api/digital-borrowings/my-active
 * Fetches the logged-in student's currently active digital borrows.
 * Automatically marks expired borrows and calculates days remaining.
 */
export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const nowIso = now.toISOString();

    // 1. Auto-expire any borrows whose due_date has passed
    try {
      await supabase
        .from("digital_borrowings")
        .update({ status: "expired", returned_at: nowIso })
        .eq("student_id", user.id)
        .eq("status", "active")
        .lte("due_date", nowIso);
    } catch (expireErr) {
      console.warn("Expire check notice:", expireErr);
    }

    // 2. Fetch active borrowings with book details
    const { data: records, error } = await supabase
      .from("digital_borrowings")
      .select(`
        id,
        digital_book_id,
        borrowed_at,
        due_date,
        status,
        pages_read,
        digital_books (
          id,
          title,
          author,
          category,
          cover_image_url,
          file_size_mb
        )
      `)
      .eq("student_id", user.id)
      .eq("status", "active")
      .order("due_date", { ascending: true });

    let activeBorrows = [];

    if (!error && records) {
      activeBorrows = records.map((r) => {
        let book = r.digital_books ? {
          ...r.digital_books,
          cover_url: r.digital_books.cover_image_url || r.digital_books.cover_url || "",
        } : null;
        if (!book) {
  book = {
    id: r.digital_book_id,
    title: "Digital Book (unavailable)",
    author: "Unknown",
    category: "General",
    cover_url: "",
  };
}

        const remaining = calculateDigitalLoanRemaining(r.due_date, r.borrowed_at);

        return {
          id: r.id,
          digital_book_id: r.digital_book_id,
          book,
          borrowed_at: r.borrowed_at,
          due_date: r.due_date,
          status: remaining.isExpired ? "expired" : "active",
          days_remaining: remaining.daysRemaining,
          percent_used: remaining.percentUsed,
        };
      });

      // Filter out any that just expired
      activeBorrows = activeBorrows.filter((b) => b.status === "active");
    }

    return NextResponse.json({
      success: true,
      active_borrows: activeBorrows,
      total_active_count: activeBorrows.length,
      max_allowed: 2,
    });
  } catch (err) {
    console.error("GET /api/digital-borrowings/my-active error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch active digital borrowings." },
      { status: 500 }
    );
  }
}

