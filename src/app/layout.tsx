import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Devanagari } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const latin = Noto_Sans({ subsets: ["latin"], variable: "--font-latin" });
const deva = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--font-deva" });

export const metadata: Metadata = { title: "Agri Shop" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" className={`${latin.variable} ${deva.variable}`}>
      <body className="font-sans antialiased"><I18nProvider>{children}</I18nProvider></body>
    </html>
  );
}
