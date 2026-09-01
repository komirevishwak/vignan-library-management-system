import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const FINE_RATE_PER_DAY = 5; // ₹5 per day

/**
 * Calculates overdue fine amount
 * @param {string|Date} dueDate
 * @param {string|Date} [returnDate]
 * @returns {{ daysOverdue: number, fine: number, isOverdue: boolean }}
 */
export function calculateFine(dueDate, returnDate = null) {
  if (!dueDate) return { daysOverdue: 0, fine: 0, isOverdue: false };

  const due = new Date(dueDate);
  due.setHours(23, 59, 59, 999);
  
  const end = returnDate ? new Date(returnDate) : new Date();

  if (end > due) {
    const diffTime = end.getTime() - due.getTime();
    const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      daysOverdue: Math.max(0, daysOverdue),
      fine: Math.max(0, daysOverdue * FINE_RATE_PER_DAY),
      isOverdue: true,
    };
  }

  return { daysOverdue: 0, fine: 0, isOverdue: false };
}

export function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return (
    url &&
    key &&
    !url.includes("placeholder") &&
    !url.includes("your-project") &&
    !key.includes("your-anon-key")
  );
}

export const CATEGORIES = [
  "Computer Science",
  "AI & Data Science",
  "Electronics",
  "Mathematics",
  "Physics",
  "Literature",
  "Business",
  "Mechanical",
  "Civil",
  "General",
];

export const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Artificial Intelligence & Data Science",
  "Electronics & Communication",
  "Electrical & Electronics",
  "Mechanical Engineering",
  "Civil Engineering",
  "Management Studies (MBA)",
];

export const STUDY_YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Postgraduate",
];
