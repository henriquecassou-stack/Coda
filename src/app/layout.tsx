import type { Metadata, Viewport } from "next";
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

const title = "CODA — Websites + Automações";
const description =
  "Automação inteligente e sites que convertem, para pequenas e médias empresas que querem operar como grandes.";

// Absolute URLs for og:image/canonical are built from this. Set
// NEXT_PUBLIC_SITE_URL to the real domain when the site goes live — the
// fallback only keeps local builds and previews working.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coda.studio";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "CODA",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#050507",
  colorScheme: "dark",
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
