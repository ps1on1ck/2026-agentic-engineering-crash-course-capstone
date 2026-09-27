import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ETF Dashboard",
  description: "Browse and compare demo ETF data. Not investment advice.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="w-full px-4 py-3 border-b bg-white dark:bg-zinc-900">
          <span className="font-semibold text-sm">ETF Dashboard</span>
        </nav>
        <div
          className="w-full px-4 py-2 text-center text-xs bg-amber-50 text-amber-800 border-b border-amber-200"
        >
          Demo data — not investment advice
        </div>
        {children}
      </body>
    </html>
  );
}
