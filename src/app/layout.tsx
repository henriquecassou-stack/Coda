import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
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

// O título e a descrição são o que aparece no resultado do Google. Os termos
// que as pessoas digitam ("automação com IA", "criação de sites") vêm antes da
// marca: quem ainda não conhece a CODA não procura por "CODA". Título com até
// ~60 caracteres e descrição com até ~155, para o Google não cortar no meio.
const title = "Automação com IA e Criação de Sites para Empresas | CODA";
const description =
  "Agência de automação com IA e criação de sites para pequenas e médias empresas: agentes de IA no WhatsApp, integração com CRM e ERP e sites que convertem.";
// Na prévia do WhatsApp/LinkedIn a marca já aparece no card, então ela vem primeiro.
const shareTitle = "CODA — Automação com IA e Criação de Sites";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  // O canonical fica na página inicial ((site)/page.tsx), e não aqui: no layout
  // raiz ele era herdado pelo 404 e pelo painel, que diziam "eu sou a home".
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "CODA",
    title: shareTitle,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: shareTitle,
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
      {/* Só o esqueleto vive aqui. O cabeçalho, o rodapé, o cursor, a rolagem
          suave e as camadas animadas ficam em (site)/layout.tsx, para o painel
          de visitas em /painel não herdar nada disso. */}
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
