import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.EMAIL_FROM || "Vignandhara Library <library@yourdomain.com>";

function escapeHtml(value = "") {
  return String(value).replace(/[&<>\"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[character]));
}

async function sendEmail({ to, subject, title, body }) {
  if (!resend) return { skipped: true, reason: "RESEND_API_KEY is not configured" };
  return resend.emails.send({ from, to, subject, html: `<main style="font-family:Arial,sans-serif;line-height:1.6"><h2>${escapeHtml(title)}</h2><p>${body}</p><p>Vignandhara Library</p></main>` });
}

export function sendDueDateReminder({ to, studentName, bookTitle, dueDate }) {
  return sendEmail({ to, subject: `Reminder: ${bookTitle} is due on ${dueDate}`, title: "Book due date reminder", body: `Hi ${escapeHtml(studentName)}, your borrowed book <strong>${escapeHtml(bookTitle)}</strong> is due on <strong>${escapeHtml(dueDate)}</strong>.` });
}

export function sendOverdueNotification({ to, studentName, bookTitle, daysOverdue, fineAmount }) {
  return sendEmail({ to, subject: `Overdue notice: ${bookTitle}`, title: "Overdue book notice", body: `Hi ${escapeHtml(studentName)}, <strong>${escapeHtml(bookTitle)}</strong> is ${daysOverdue} day(s) overdue. Current fine: <strong>${escapeHtml(fineAmount)}</strong>.` });
}

export function sendWelcomeEmail({ to, studentName, rollNumber }) {
  return sendEmail({ to, subject: `Welcome to Vignandhara Library, ${studentName}`, title: "Welcome to Vignandhara Library", body: `Hi ${escapeHtml(studentName)}, your library account is ready${rollNumber ? ` with roll number <strong>${escapeHtml(rollNumber)}</strong>` : ""}.` });
}
