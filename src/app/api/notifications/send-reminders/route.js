import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendDueDateReminder } from "@/lib/email-service";

function authorized(request) { return !process.env.CRON_SECRET || request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`; }
export async function GET(request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createClient();
  const now = new Date();
  const { data: loans, error } = await supabase.from("borrow_records").select("id, due_date, profiles(email, full_name, email_notifications_enabled, reminder_days_before), books(title)").eq("status", "issued").gte("due_date", now.toISOString());
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const sent = [];
  for (const loan of loans || []) {
    const days = Number(loan.profiles?.reminder_days_before || 2);
    const due = new Date(loan.due_date);
    const daysUntilDue = Math.ceil((due - now) / 86400000);
    if (loan.profiles?.email_notifications_enabled !== false && daysUntilDue <= days) {
      sent.push(await sendDueDateReminder({ to: loan.profiles.email, studentName: loan.profiles.full_name, bookTitle: loan.books?.title, dueDate: due.toLocaleDateString("en-IN") }));
    }
  }
  return NextResponse.json({ success: true, processed: (loans || []).length, sent: sent.length });
}
