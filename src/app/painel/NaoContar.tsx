"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Quem abre o painel é o dono do site, e o dono do site visita o site o tempo
 * todo. Ao entrar aqui, este navegador para de ser contado — senão os próprios
 * testes e conferências inflariam os números que o painel mostra.
 *
 * O valor vive no localStorage, que o rastreador (Tracker.tsx) lê. Ele é lido
 * com useSyncExternalStore, a forma do React para acompanhar um armazenamento
 * externo; um evento próprio avisa as mudanças feitas nesta mesma aba, já que
 * o evento "storage" do navegador só dispara nas outras.
 */
const CHAVE = "coda-nao-contar";
const EVENTO = "coda-nao-contar-mudou";

function ler(): string | null {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return "bloqueado";
  }
}

function assinar(aviso: () => void) {
  window.addEventListener("storage", aviso);
  window.addEventListener(EVENTO, aviso);
  return () => {
    window.removeEventListener("storage", aviso);
    window.removeEventListener(EVENTO, aviso);
  };
}

function gravar(valor: "0" | "1") {
  try {
    localStorage.setItem(CHAVE, valor);
    window.dispatchEvent(new Event(EVENTO));
  } catch {}
}

export function NaoContar() {
  const valor = useSyncExternalStore(assinar, ler, () => "servidor");

  // Na primeira entrada no painel, liga a exclusão automaticamente.
  useEffect(() => {
    if (ler() === null) gravar("1");
  }, []);

  if (valor !== "0" && valor !== "1") return null;
  const ignorado = valor === "1";

  return (
    <p className="text-xs text-[var(--color-fg-faint)]">
      {ignorado ? "Este navegador não entra na contagem." : "Este navegador está sendo contado."}{" "}
      <button
        type="button"
        onClick={() => gravar(ignorado ? "0" : "1")}
        className="text-[var(--color-fg-muted)] underline underline-offset-2 hover:text-white"
      >
        {ignorado ? "Contar este navegador" : "Parar de contar este navegador"}
      </button>
    </p>
  );
}
