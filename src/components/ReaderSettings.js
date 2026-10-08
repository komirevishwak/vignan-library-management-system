"use client";

export default function ReaderSettings({ settings, onChange }) {
  const update = (key, value) => onChange({ ...settings, [key]: value });
  return (
    <aside aria-label="Reader settings" className="space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-200">
      <label className="block">Font size<select value={settings.fontSize} onChange={(e) => update("fontSize", e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-2 py-2"><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option><option value="extra-large">Extra large</option></select></label>
      <label className="block">Font family<select value={settings.fontFamily} onChange={(e) => update("fontFamily", e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-2 py-2"><option value="sans">Sans serif</option><option value="serif">Serif</option><option value="dyslexic">Dyslexic-friendly</option></select></label>
      <label className="block">Line height<select value={settings.lineHeight} onChange={(e) => update("lineHeight", e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-2 py-2"><option value="normal">Normal</option><option value="relaxed">Relaxed</option><option value="loose">Loose</option></select></label>
      <label className="block">Page background<select value={settings.background} onChange={(e) => update("background", e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-2 py-2"><option value="white">White</option><option value="sepia">Sepia</option><option value="dark">Dark</option></select></label>
    </aside>
  );
}
