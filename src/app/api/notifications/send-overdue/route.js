import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendOverdueNotification } from "@/lib/email-service";

function authorized(request) { return !process.env.CRON_SECRET || request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`; }
export async function GET(request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createClient();
  const now = new Date();
  const { data: loans, error } = await supabase.from("borrow_records").select("id, due_date, fine_amount, profiles(email, full_name, email_notifications_enabled), books(title)").in("status", ["issued", "overdue"]).lt("due_date", now.toISOString());
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const sent = [];
  for (const loan of loans || []) if (loan.profiles?.email_notifications_enabled !== false) sent.push(await sendOverdueNotification({ to: loan.profiles.email, studentName: loan.profiles.full_name, bookTitle: loan.books?.title, daysOverdue: Math.max(1, Math.ceil((now - new Date(loan.due_date)) / 86400000)), fineAmount: loan.fine_amount || 0 }));
  return NextResponse.json({ success: true, processed: (loans || []).length, sent: sent.length });
}
