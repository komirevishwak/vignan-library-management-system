import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DIGITAL_BOOKS_SEED } from "@/lib/digital-books-data";

/**
 * GET /api/digital-books/:id
 * Fetches public details for a single digital book (excluding file_url)
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("digital_books")
      .select("id, title, author, isbn, category, description, cover_image_url, file_size_mb, total_copies_available, created_at")
      .eq("id", id)
      .maybeSingle();

    if (data) {
      return NextResponse.json({
        success: true,
        book: {
          ...data,
          cover_url: data.cover_image_url || data.cover_url || "",
        },
      });
    }

    // Fallback to static seed
    const seedMatch = DIGITAL_BOOKS_SEED.find((b) => b.id === id);
    if (seedMatch) {
      const { file_url, ...safeBook } = seedMatch;
      return NextResponse.json({ success: true, book: safeBook });
    }

    return NextResponse.json({ error: "Digital book not found" }, { status: 404 });
  } catch (err) {
    console.error("GET /api/digital-books/:id error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch book" },
      { status: 500 }
    );
  }
}
