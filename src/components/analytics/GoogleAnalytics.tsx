import Script from "next/script";
import { gaId } from "@/lib/site";

/**
 * Google Analytics 4 (gtag.js), carregado depois da hidratação para não
 * disputar o carregamento da página com o próprio site.
 *
 * Fica no layout do site público, não no raiz, então o /painel não é medido.
 * E respeita a mesma marca do painel de visitas: o navegador de quem entrou
 * no painel ("coda-nao-contar" no localStorage) e navegadores automatizados
 * ligam o `ga-disable-<id>`, a chave oficial do gtag para não enviar nada —
 * o dono do site não infla os números do GA também.
 *
 * Os domínios do Google estão liberados na CSP em next.config.ts; sem isso o
 * navegador bloqueia o script e o GA fica zerado sem erro visível.
 */
export function GoogleAnalytics() {
  if (!gaId) return null;
  const id = JSON.stringify(gaId);
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`try{if(navigator.webdriver||localStorage.getItem("coda-nao-contar")==="1")window["ga-disable-"+${id}]=true}catch(e){}
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag("js",new Date());
gtag("config",${id});`}
      </Script>
    </>
  );
}
