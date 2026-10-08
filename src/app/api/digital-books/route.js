import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DIGITAL_BOOKS_SEED } from "@/lib/digital-books-data";

export const dynamic = "force-dynamic";

/**
 * GET /api/digital-books
 * Public endpoint to browse digital books catalog with optional filtering & search
 * Security: excludes file_url from the response
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const supabase = createClient();
    let query = supabase
      .from("digital_books")
      .select("id, title, author, isbn, category, description, cover_image_url, external_link, file_size_mb, total_copies_available, created_at")
      .order("title", { ascending: true })
      .range(offset, offset + limit - 1);

    if (category && category !== "All") {
      query = query.eq("category", category);
    }

    if (search && search.trim()) {
      const s = search.trim();
      query = query.or(`title.ilike.%${s}%,author.ilike.%${s}%,isbn.ilike.%${s}%`);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return NextResponse.json({
        success: true,
        books: [],
        total: 0,
        isFallback: true,
      });
    }

    const books = (data || []).map((book) => ({
      ...book,
      cover_url: book.cover_image_url || book.cover_url || "",
    }));

    return NextResponse.json({
      success: true,
      books,
      total: books.length,
    });
  } catch (err) {
    console.error("GET /api/digital-books error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch digital books" },
      { status: 500 }
    );
  }
}
