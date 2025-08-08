import type { Metadata } from "next";
import Header from "../components/Header";
import ConditionalGlobalBoard from "../components/ConditionalGlobalBoard";
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
  title: "NeuroCanvas",
  description: "AI-powered thought mapping",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-slate-900 via-yellow-600 to-slate-900 text-white min-h-screen`}> 
        <ConditionalGlobalBoard />
        <div className="sticky top-0 z-50">
          <Header />
        </div>
        <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
          {children}
        </div>
      </body>
    </html>
  );
}
