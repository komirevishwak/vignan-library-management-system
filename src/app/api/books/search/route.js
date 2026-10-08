import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";
  const category = searchParams.get("category");
  const availability = searchParams.get("availability");
  const sortBy = searchParams.get("sortBy") || "title";
  const supabase = createClient();
  let booksQuery = supabase.from("books").select("*");
  if (query) booksQuery = booksQuery.or(`title.ilike.%${query}%,author.ilike.%${query}%,description.ilike.%${query}%`);
  if (category && category !== "All") booksQuery = booksQuery.eq("category", category);
  if (availability === "available") booksQuery = booksQuery.gt("available_copies", 0);
  if (availability === "unavailable") booksQuery = booksQuery.eq("available_copies", 0);
  if (sortBy === "newest") booksQuery = booksQuery.order("created_at", { ascending: false });
  else if (sortBy === "author") booksQuery = booksQuery.order("author", { ascending: true });
  else booksQuery = booksQuery.order("title", { ascending: true });
  const { data, error } = await booksQuery.limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ books: data || [] });
}
