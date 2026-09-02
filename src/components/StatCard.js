"use client";

export default function StatCard({ title, value, icon: Icon, color = "emerald", subtitle, alert = false }) {
  const colorMap = {
    blue: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconBg: "bg-emerald-600 text-white",
      badge: "bg-emerald-100 text-emerald-800",
    },
    amber: {
      bg: "bg-amber-50 text-amber-800 border-amber-200",
      iconBg: "bg-amber-500 text-white",
      badge: "bg-amber-100 text-amber-800",
    },
    rose: {
      bg: "bg-rose-50 text-rose-800 border-rose-200",
      iconBg: "bg-rose-600 text-white",
      badge: "bg-rose-100 text-rose-800",
    },
    emerald: {
      bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
      iconBg: "bg-emerald-600 text-white",
      badge: "bg-emerald-100 text-emerald-800",
    },
    purple: {
      bg: "bg-purple-50 text-purple-800 border-purple-200",
      iconBg: "bg-purple-600 text-white",
      badge: "bg-purple-100 text-purple-800",
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className={`p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${alert ? "ring-2 ring-rose-500/50" : ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${scheme.iconBg}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
      {alert && (
        <span className="absolute top-2 right-2 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
        </span>
      )}
    </div>
  );
}
