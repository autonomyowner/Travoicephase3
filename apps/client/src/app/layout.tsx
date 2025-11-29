import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "../components/Header";
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
  title: "TRAVoices - Speak Naturally, Be Understood Instantly",
  description:
    "AI-powered real-time voice translation platform. Speak any language and be heard in your own cloned voice. Bridge conversations across cultures with 20+ languages.",
  keywords: [
    "voice translation",
    "AI translation",
    "real-time translation",
    "voice cloning",
    "multilingual communication",
    "language barrier",
    "speech translation",
  ],
  authors: [{ name: "TRAVoices" }],
  openGraph: {
    title: "TRAVoices - Speak Naturally, Be Understood Instantly",
    description:
      "AI-powered real-time voice translation with natural voice cloning. Break language barriers instantly.",
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
        <ClerkProvider>
          <LanguageProvider>
            <div className="sticky top-0 z-50">
              <Header />
            </div>
            <main>{children}</main>
          </LanguageProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
