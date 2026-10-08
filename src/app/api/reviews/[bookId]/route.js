import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request, { params }) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const page = Math.max(0, Number(searchParams.get("page")) || 0);
  const { data, error, count } = await supabase.from("book_reviews").select("*, profiles(full_name, photo_url)", { count: "exact" }).eq("book_id", params.bookId).order("created_at", { ascending: false }).range(page * 10, page * 10 + 9);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reviews: data || [], total: count || 0, page });
}

export async function POST(request, { params }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in to review books." }, { status: 401 });
  const body = await request.json();
  const rating = Number(body.rating);
  const reviewText = String(body.review_text || "").trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  if (reviewText.length < 10 || reviewText.length > 2000) return NextResponse.json({ error: "Review must be between 10 and 2000 characters." }, { status: 400 });
  const { data: borrow } = await supabase.from("borrow_records").select("id").eq("book_id", params.bookId).eq("student_id", user.id).limit(1).maybeSingle();
  const { data, error } = await supabase.from("book_reviews").upsert({ book_id: params.bookId, student_id: user.id, rating, review_text: reviewText, is_verified_borrower: Boolean(borrow) }, { onConflict: "book_id,student_id" }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ review: data }, { status: 201 });
}
