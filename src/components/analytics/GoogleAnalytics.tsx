"use client";

import { useEffect } from "react";
import Script from "next/script";
import { gaId } from "@/lib/site";
import { useConsentimento } from "@/lib/consent";

/** Apaga os cookies do GA (_ga e _ga_<id>) de quem aceitou e depois recusou. */
function apagarCookiesGa() {
  const nomes = document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((n) => n === "_ga" || n.startsWith("_ga_"));
  if (nomes.length === 0) return;
  // O gtag grava no domínio raiz (.codaautomacoes.com); apagar exige repetir
  // o mesmo domínio, então tenta as três formas possíveis.
  const host = location.hostname;
  const dominios = ["", host, `.${host.replace(/^www\./, "")}`];
  for (const n of nomes) {
    for (const d of dominios) {
      document.cookie = `${n}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
    }
  }
}

/**
 * Google Analytics 4 (gtag.js), carregado só depois que o visitante aceita os
 * cookies no aviso (CookieBanner) — antes disso o script nem é baixado.
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
  const consentimento = useConsentimento();

  // Recusou depois de ter aceitado nesta mesma página: o gtag já carregado
  // para de enviar e os cookies que ele gravou são apagados.
  useEffect(() => {
    if (!gaId || consentimento !== "recusado") return;
    (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] = true;
    apagarCookiesGa();
  }, [consentimento]);

  if (!gaId || consentimento !== "aceito") return null;
  const id = JSON.stringify(gaId);
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`var naoContar=false;try{naoContar=navigator.webdriver||localStorage.getItem("coda-nao-contar")==="1"}catch(e){}
window["ga-disable-"+${id}]=naoContar;
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag("js",new Date());
gtag("config",${id});`}
      </Script>
    </>
  );
}
