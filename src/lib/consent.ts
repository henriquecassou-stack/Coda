import { useSyncExternalStore } from "react";

/**
 * A escolha do visitante sobre cookies, guardada no localStorage para valer
 * nas próximas visitas. O Google Analytics só carrega com "aceito" — antes da
 * escolha, ou com "recusado", nenhum cookie do Google é gravado.
 *
 * O painel próprio (/painel) não entra nisto: ele não usa cookie nem guarda
 * nada que identifique a pessoa (ver Tracker.tsx).
 */
export type Consentimento = "aceito" | "recusado";

const CHAVE = "coda-cookies";
const MUDOU = "coda-cookies";
const ABRIR = "coda-cookies-abrir";

// Navegador que bloqueia o localStorage (aba anônima em alguns, site data
// bloqueado): a escolha vale ao menos até a página fechar, em vez de o aviso
// não sumir depois do clique.
let memoria: Consentimento | null = null;

function ler(): Consentimento | null {
  try {
    const v = localStorage.getItem(CHAVE);
    if (v === "aceito" || v === "recusado") return v;
  } catch {}
  return memoria;
}

export function salvarConsentimento(v: Consentimento) {
  memoria = v;
  try {
    localStorage.setItem(CHAVE, v);
  } catch {}
  window.dispatchEvent(new Event(MUDOU));
}

function assinar(avisar: () => void) {
  window.addEventListener(MUDOU, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(MUDOU, avisar);
    window.removeEventListener("storage", avisar);
  };
}

/** `undefined` no servidor (ainda não se sabe), `null` sem escolha. */
export function useConsentimento(): Consentimento | null | undefined {
  return useSyncExternalStore(assinar, ler, () => undefined);
}

/** Reabre o aviso — o link "Preferências de cookies" do rodapé. */
export function abrirPreferenciasCookies() {
  window.dispatchEvent(new Event(ABRIR));
}

export function aoAbrirPreferencias(abrir: () => void) {
  window.addEventListener(ABRIR, abrir);
  return () => window.removeEventListener(ABRIR, abrir);
}
