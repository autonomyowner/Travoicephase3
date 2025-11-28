import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import Header from "../components/Header";
import { AuthProvider } from "../components/AuthProvider";
import { LanguageProvider } from "../components/LanguageProvider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Matcha - Understand Your Mind",
  description:
    "The AI that decodes your thought patterns, identifies your cognitive biases, and helps you understand the root of your challenges.",
  keywords: [
    "psychology",
    "AI",
    "cognitive biases",
    "personal development",
    "psychological analysis",
  ],
  authors: [{ name: "Matcha" }],
  openGraph: {
    title: "Matcha - Understand Your Mind",
    description:
      "The AI that decodes your thought patterns and helps you overcome your blockers.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${dmSerif.variable} antialiased min-h-screen`}
        style={{
          background: "var(--bg-page)",
          color: "var(--text-primary)",
          fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
        }}
      >
        <LanguageProvider>
          <AuthProvider>
            <div className="sticky top-0 z-50">
              <Header />
            </div>
            <main>{children}</main>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
