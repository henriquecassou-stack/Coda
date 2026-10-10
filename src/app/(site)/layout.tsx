import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/ui/Preloader";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { CursorTrail } from "@/components/ui/CursorTrail";
import { PageSignal } from "@/components/canvas/PageSignal";
import { StructuredData } from "@/components/StructuredData";
import { Tracker } from "@/components/analytics/Tracker";

/**
 * O "chrome" do site público. Vive num grupo de rotas, e não no layout raiz,
 * para que o painel de visitas (/painel) seja uma página limpa — sem cabeçalho
 * de marketing, cursor personalizado, rolagem suave nem a camada animada — e,
 * principalmente, sem o rastreador: o painel não conta visita a si mesmo.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
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
      <CursorTrail />
      <Tracker />
      <Header />
      <main id="conteudo">{children}</main>
      <Footer />
    </>
  );
}
