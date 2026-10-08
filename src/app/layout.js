import "./globals.css";
import SetupBanner from "@/components/SetupBanner";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata = {
  title: "Vignandhara | College Library Management System",
  description: "Vignandhara - Modern, comprehensive Library Management System for colleges and universities. Manage books, student borrows, returns, fines, and catalog with ease.",
  manifest: "/manifest.json",
  themeColor: "#15803d",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased font-sans text-slate-900 bg-slate-50 dark:text-slate-100 dark:bg-slate-950 min-h-screen flex flex-col">
        <ThemeProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-brand-700 focus:shadow-lg">Skip to main content</a>
          <SetupBanner />
          <div id="main-content" className="contents">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
