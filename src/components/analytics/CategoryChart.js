"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
const colors = ["#15803d", "#0369a1", "#d97706", "#be123c", "#475569"];
export default function CategoryChart({ data = [] }) { return <div className="h-72 w-full"><ResponsiveContainer><PieChart><Pie data={data} dataKey="book_count" nameKey="category" cx="50%" cy="50%" outerRadius={90}>{data.map((entry, index) => <Cell key={entry.category} fill={colors[index % colors.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>; }
