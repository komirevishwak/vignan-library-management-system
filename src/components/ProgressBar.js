"use client";

export default function ProgressBar({ value = 0, label = "Reading progress", showValue = true }) {
  const progress = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div aria-label={`${label}: ${progress}%`} role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}>
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
        <span>{label}</span>
        {showValue && <span>{progress}%</span>}
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-brand-600 transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
