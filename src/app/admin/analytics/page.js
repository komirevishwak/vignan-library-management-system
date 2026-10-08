"use client";

import { useEffect, useState } from "react";
import OverviewCards from "@/components/analytics/OverviewCards";
import CirculationChart from "@/components/analytics/CirculationChart";
import CategoryChart from "@/components/analytics/CategoryChart";

export default function AnalyticsPage() {
  const [data, setData] = useState({ overview: {}, circulation: [], categories: [], books: [] });
  useEffect(() => { Promise.all(["overview", "circulation", "categories", "popular-books"].map((endpoint) => fetch(`/api/admin/analytics/${endpoint}`).then((response) => response.json()))).then(([overview, circulation, categories, books]) => setData({ overview: overview.overview, circulation: circulation.circulation, categories: categories.categories, books: books.books })); }, []);
  return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-7xl"><header className="mb-8"><p className="text-xs font-bold uppercase tracking-widest text-brand-700">Admin analytics</p><h1 className="mt-2 text-3xl font-extrabold text-slate-950">Library activity</h1></header><OverviewCards overview={data.overview} /><div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="mb-4 font-bold text-slate-900">Circulation trends</h2><CirculationChart data={data.circulation} /></section><section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="mb-4 font-bold text-slate-900">Category distribution</h2><CategoryChart data={data.categories} /></section></div><section className="mt-6 rounded-xl border border-slate-200 bg-white p-5"><h2 className="mb-4 font-bold text-slate-900">Popular books</h2><div className="divide-y divide-slate-100">{data.books.map((book) => <div key={book.id} className="flex justify-between gap-4 py-3 text-sm"><span className="font-semibold text-slate-800">{book.title}</span><span className="text-slate-500">{book.borrow_count} borrows</span></div>)}</div></section></div></main>;
}
