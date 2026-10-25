"use client";

import { useEffect, useRef, useState } from "react";
import { gaId } from "@/lib/site";
import { aoAbrirPreferencias, salvarConsentimento, useConsentimento, type Consentimento } from "@/lib/consent";
import { Button } from "@/components/ui/Button";

/**
 * Aviso de cookies (LGPD). Aparece até o visitante escolher e volta pelo link
 * "Preferências de cookies" do rodapé. Aceitar e recusar têm o mesmo tamanho
 * e ficam lado a lado: recusar não pode dar mais trabalho que aceitar.
 *
 * Não é modal — o site continua navegável com o aviso aberto — e fica abaixo
 * do cursor personalizado (z-90) e do preloader (z-100).
 */
export function CookieBanner() {
  const consentimento = useConsentimento();
  const [reaberto, setReaberto] = useState(false);
  const primeiroBotao = useRef<HTMLDivElement>(null);

  useEffect(() => aoAbrirPreferencias(() => setReaberto(true)), []);

  // Quem reabriu pelo rodapé (mouse ou teclado) cai direto nas opções.
  useEffect(() => {
    if (reaberto) primeiroBotao.current?.querySelector("button")?.focus();
  }, [reaberto]);

  // Sem GA não há cookie nenhum a pedir; no servidor ainda não se sabe a escolha.
  if (!gaId || consentimento === undefined) return null;
  if (consentimento !== null && !reaberto) return null;

  const escolher = (v: Consentimento) => {
    salvarConsentimento(v);
    setReaberto(false);
  };

  return (
    <section
      aria-labelledby="cookies-titulo"
      className="cookie-banner fixed inset-x-4 bottom-4 z-[70] rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[24rem] sm:p-6"
    >
      <h2 id="cookies-titulo" className="font-[var(--font-display)] text-base font-bold text-white">
        Cookies
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-fg-muted)]">
        Usamos cookies do Google Analytics para medir as visitas e melhorar o site. Eles só são ativados
        se você aceitar.
      </p>
      {consentimento !== null && (
        <p className="mt-2 text-xs text-[var(--color-fg-faint)]">
          Sua escolha atual: {consentimento === "aceito" ? "aceitos" : "recusados"}.
        </p>
      )}
      <div ref={primeiroBotao} className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => escolher("recusado")} className="px-4">
          Recusar
        </Button>
        <Button onClick={() => escolher("aceito")} className="px-4">
          Aceitar
        </Button>
      </div>
    </section>
  );
}
