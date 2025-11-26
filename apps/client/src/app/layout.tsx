import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import Header from "../components/Header";
import { AuthProvider } from "../components/AuthProvider";
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
  title: "Matcha - Comprenez votre esprit",
  description:
    "L'IA qui décode vos schémas de pensée, identifie vos biais cognitifs, et vous aide à comprendre la racine de vos défis.",
  keywords: [
    "psychologie",
    "IA",
    "biais cognitifs",
    "développement personnel",
    "analyse psychologique",
  ],
  authors: [{ name: "Matcha" }],
  openGraph: {
    title: "Matcha - Comprenez votre esprit",
    description:
      "L'IA qui décode vos schémas de pensée et vous aide à surmonter vos blocages.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${dmSans.variable} ${dmSerif.variable} antialiased min-h-screen`}
        style={{
          background: "var(--bg-page)",
          color: "var(--text-primary)",
          fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
        }}
      >
        <AuthProvider>
          <div className="sticky top-0 z-50">
            <Header />
          </div>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
