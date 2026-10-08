import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request, { params }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const reviewId = params.bookId;
  const { error: voteError } = await supabase.from("review_votes").insert({ review_id: reviewId, student_id: user.id });
  if (voteError?.code === "23505") return NextResponse.json({ error: "You already marked this review helpful." }, { status: 409 });
  if (voteError) return NextResponse.json({ error: voteError.message }, { status: 500 });
  const { data: review } = await supabase.from("book_reviews").select("helpful_count").eq("id", reviewId).single();
  const { data, error } = await supabase.from("book_reviews").update({ helpful_count: Number(review?.helpful_count || 0) + 1 }).eq("id", reviewId).select("helpful_count").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ helpful_count: data.helpful_count });
}
