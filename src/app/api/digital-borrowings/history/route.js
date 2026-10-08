import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DIGITAL_BOOKS_SEED } from "@/lib/digital-books-data";

/**
 * GET /api/digital-borrowings/history
 * Returns historical digital borrowings (returned or expired) for the student.
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

    const { data: records, error } = await supabase
      .from("digital_borrowings")
      .select(`
        id,
        digital_book_id,
        borrowed_at,
        due_date,
        returned_at,
        status,
        pages_read,
        digital_books (
          id,
          title,
          author,
          category,
          cover_image_url
        )
      `)
      .eq("student_id", user.id)
      .neq("status", "active")
      .order("returned_at", { ascending: false });

    const history = (records || []).map((r) => {
      let book = r.digital_books ? {
        ...r.digital_books,
        cover_url: r.digital_books.cover_image_url || r.digital_books.cover_url || "",
      } : null;
      if (!book) {
        book = DIGITAL_BOOKS_SEED.find((b) => b.id === r.digital_book_id) || {
          title: "Digital Book",
          author: "Academic Press",
          category: "General",
        };
      }
      return {
        ...r,
        book,
      };
    });

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (err) {
    console.error("GET /api/digital-borrowings/history error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch borrowing history" },
      { status: 500 }
    );
  }
}
