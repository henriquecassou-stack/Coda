import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/ui/Preloader";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { PageSignal } from "@/components/canvas/PageSignal";
import { StructuredData } from "@/components/StructuredData";
import { siteUrl } from "@/lib/site";

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
      <body className="min-h-full antialiased">
        {/* Off-screen until focused. The first Tab on the page used to land on
            the logo, so a keyboard user walked the entire nav before reaching
            any content. */}
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-black"
        >
          Pular para o conteúdo
        </a>
        <StructuredData />
        <PageSignal />
        <Preloader />
        <ScrollProgress />
        <SmoothScroll />
        <CustomCursor />
        <Header />
        <main id="conteudo">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
