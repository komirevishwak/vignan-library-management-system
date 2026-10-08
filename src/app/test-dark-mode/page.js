"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function DarkModeTestPage() {
  const { theme, toggleTheme } = useTheme();
  const [darkClassActive, setDarkClassActive] = useState(false);

  useEffect(() => {
    setDarkClassActive(document.documentElement.classList.contains("dark"));
  }, [theme]);

  return (
    <div className="min-h-screen p-8 bg-white dark:bg-slate-900">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Dark Mode Test Page
        </h1>

        <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <p className="text-slate-700 dark:text-slate-300">
            Current theme: <strong>{theme}</strong>
          </p>
          <p className="text-slate-700 dark:text-slate-300 mt-2">
            HTML has dark class: <strong>{darkClassActive ? "Yes" : "No"}</strong>
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-semibold transition"
        >
          Toggle Theme (Current: {theme})
        </button>

        <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Color Tests</h2>

          <div className="p-4 bg-white dark:bg-slate-700 rounded">
            <p className="text-slate-900 dark:text-slate-100">This text should change color</p>
          </div>

          <div className="p-4 bg-green-100 dark:bg-green-900 rounded">
            <p className="text-green-900 dark:text-green-100">Green box test</p>
          </div>

          <div className="p-4 bg-red-100 dark:bg-red-900 rounded">
            <p className="text-red-900 dark:text-red-100">Red box test</p>
          </div>
        </div>

        <div className="text-sm text-slate-500 dark:text-slate-400">
          If colors do not change when you toggle, Tailwind dark mode is not working.
        </div>
      </div>
    </div>
  );
}
