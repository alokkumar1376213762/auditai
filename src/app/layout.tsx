import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07090e",
};

export const metadata: Metadata = {
  title: "AuditAI — Instant AI Website Rating & Deep Audit Reports",
  description:
    "Evaluate any website URL across Visual Design, SEO, Core Web Vitals, Usability, and WCAG Accessibility. Powered by ultra-fast Groq LPU AI.",
  keywords: [
    "website rating",
    "ai website audit",
    "seo checker",
    "performance rating",
    "accessibility audit",
    "groq ai",
    "website score",
  ],
  authors: [{ name: "AuditAI" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark antialiased`}>
      <body className="min-h-screen bg-[#07090e] font-sans text-slate-100 flex flex-col">
        {children}
      </body>
    </html>
  );
}
