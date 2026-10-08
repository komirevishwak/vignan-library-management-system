"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
export default function CirculationChart({ data = [] }) { return <div className="h-72 w-full"><ResponsiveContainer><LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="month" /><YAxis allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="total_borrows" stroke="#15803d" strokeWidth={3} /></LineChart></ResponsiveContainer></div>; }
