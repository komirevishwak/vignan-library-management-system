import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DIGITAL_BOOKS_SEED, generateEbookPdf } from "@/lib/digital-books-data";

/**
 * GET /api/digital-borrowings/:id/read
 * Secure endpoint to stream digital book PDF to the authorized student.
 * Verifies student ownership, active loan status, and 14-day validity.
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to read." }, { status: 401 });
    }

    // 1. Fetch borrowing record
    let borrowing = null;
    const { data: dbBorrowing, error: fetchError } = await supabase
      .from("digital_borrowings")
      .select(`
        *,
        digital_books (*)
      `)
      .eq("id", id)
      .maybeSingle();

    if (dbBorrowing) {
      borrowing = dbBorrowing;
    }

    // If borrowing not found in DB, check fallback or demo
    if (!borrowing) {
      // Check if this is a demo/mock borrowing ID or student matching
      return NextResponse.json({ error: "Borrowing record not found." }, { status: 404 });
    }

    // 2. Authorization: student must own this borrowing
    if (borrowing.student_id !== user.id) {
      return NextResponse.json({ error: "Access denied. You do not own this borrowing." }, { status: 403 });
    }

    // 3. Status check: borrowing must be active
    if (borrowing.status !== "active") {
      return NextResponse.json(
        { error: `This borrowing is ${borrowing.status}. Please borrow the book again.` },
        { status: 400 }
      );
    }

    // 4. Time window check: 14-day period
    const now = new Date();
    const dueDate = new Date(borrowing.due_date);
    if (now > dueDate) {
      // Mark expired in DB
      await supabase
        .from("digital_borrowings")
        .update({ status: "expired", returned_at: now.toISOString() })
        .eq("id", id);

      return NextResponse.json(
        { error: "This book's 14-day access period has expired. Please re-borrow the title to continue reading." },
        { status: 410 }
      );
    }

    // 5. Get Book details
    let book = borrowing.digital_books;
    if (!book) {
      book = DIGITAL_BOOKS_SEED.find((b) => b.id === borrowing.digital_book_id) || {
        title: "Vignandhara Digital Book",
        author: "Academic Press",
        category: "Computer Science",
        isbn: "N/A",
      };
    }

    // 6. Generate secure, valid PDF document binary
    const pdfBuffer = generateEbookPdf(book);
    const safeFilename = encodeURIComponent((book.title || "ebook").replace(/[^a-zA-Z0-9_-]/g, "_"));

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${safeFilename}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (err) {
    console.error("GET /api/digital-borrowings/:id/read error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to serve digital book PDF." },
      { status: 500 }
    );
  }
}
