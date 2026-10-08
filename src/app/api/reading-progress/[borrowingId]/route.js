import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getUser(supabase) {
  const { data: { user }, error } = await supabase.auth.getUser();
  return error || !user ? null : user;
}

export async function GET(request, { params }) {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("reading_progress").select("*").eq("student_id", user.id).eq("digital_borrowing_id", params.borrowingId).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ progress: data || null });
}

export async function POST(request, { params }) {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const currentPage = Math.max(1, Number(body.current_page) || 1);
  const totalPages = Math.max(currentPage, Number(body.total_pages) || currentPage);
  const { data: borrowing } = await supabase.from("digital_borrowings").select("id").eq("id", params.borrowingId).eq("student_id", user.id).eq("status", "active").maybeSingle();
  if (!borrowing) return NextResponse.json({ error: "Active borrowing not found" }, { status: 404 });
  const { data, error } = await supabase.from("reading_progress").upsert({ student_id: user.id, digital_borrowing_id: params.borrowingId, current_page: currentPage, total_pages: totalPages, current_position: body.current_position || null, last_read_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { onConflict: "student_id,digital_borrowing_id" }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ progress: data });
}
