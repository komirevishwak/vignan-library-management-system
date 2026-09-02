import "./globals.css";
import SetupBanner from "@/components/SetupBanner";

export const metadata = {
  title: "Vignandhara | College Library Management System",
  description: "Vignandhara - Modern, comprehensive Library Management System for colleges and universities. Manage books, student borrows, returns, fines, and catalog with ease.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased font-sans text-slate-900 bg-slate-50 min-h-screen flex flex-col">
        <SetupBanner />
        {children}
      </body>
    </html>
  );
}
