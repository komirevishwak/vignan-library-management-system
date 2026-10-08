"use client";

const cards = [["Total borrows this month", "borrows"], ["Active students", "active_students"], ["Overdue books", "overdue"], ["Fines collected", "fines"]];
export default function OverviewCards({ overview = {} }) { return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, key]) => <article key={key} className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-2xl font-extrabold text-slate-900">{key === "fines" ? `₹${Number(overview[key] || 0).toLocaleString("en-IN")}` : Number(overview[key] || 0).toLocaleString("en-IN")}</p></article>)}</div>; }
