import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/ui/Preloader";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { CustomCursor } from "@/components/ui/CustomCursor";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  // 700 is the display weight used everywhere except the Testimonials
  // quote, which uses 500 — 600 was never actually used, so it's dropped
  // (one fewer font file downloaded; verified via grep across src/).
  weight: ["500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "CODA — Websites + Automações",
  description:
    "Automação inteligente e sites que convertem, para pequenas e médias empresas que querem operar como grandes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${spaceGrotesk.variable} ${inter.variable} h-full`}>
      <body className="min-h-full bg-[var(--color-bg)] antialiased">
        <Preloader />
        <ScrollProgress />
        <SmoothScroll />
        <CustomCursor />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
