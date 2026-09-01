"use client";

import { useState } from "react";
import { AlertTriangle, Database, X } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/utils";

export default function SetupBanner() {
  const [dismissed, setDismissed] = useState(false);
  const configured = isSupabaseConfigured();

  if (configured || dismissed) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-xs sm:text-sm font-medium border-b border-amber-600 shadow-sm flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 max-w-5xl mx-auto">
        <AlertTriangle className="w-4 h-4 text-slate-950 flex-shrink-0" />
        <span>
          <strong>Supabase Setup Required:</strong> Add your real <code className="bg-amber-600/30 px-1.5 py-0.5 rounded font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-amber-600/30 px-1.5 py-0.5 rounded font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code className="bg-amber-600/30 px-1.5 py-0.5 rounded font-mono">.env.local</code> and run <code className="bg-amber-600/30 px-1.5 py-0.5 rounded font-mono">supabase-schema.sql</code> in your Supabase SQL editor.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-slate-900 hover:text-black rounded hover:bg-amber-600/20"
        title="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
