"use client";

import { useEffect } from "react";

/**
 * Mede visitas e quanto tempo cada uma durou, e manda para /api/track.
 *
 * O que conta como "tempo na página": aba visível E pessoa ativa. Parar de
 * mexer por mais de OCIOSO_MS pausa o relógio até a próxima interação — sem
 * isso, uma aba esquecida aberta durante o almoço viraria uma visita de uma
 * hora e puxaria a média para cima.
 *
 * Privacidade: o id é aleatório e vive no sessionStorage, então morre quando
 * a aba fecha. Não há cookie, não há identificador que atravesse visitas, e o
 * servidor não grava IP. Dá para medir o comportamento sem saber quem é.
 *
 * Não conta: navegadores automatizados (navigator.webdriver) nem o navegador
 * de quem entrou no painel — o painel grava "coda-nao-contar" no
 * localStorage, para o dono do site não inflar os próprios números.
 */

const ENDPOINT = "/api/track";
const BATIMENTO_MS = 15_000;
const OCIOSO_MS = 2 * 60_000;
const K_ID = "coda-visita";
const K_MS = "coda-visita-ms";

function dispositivo(): "celular" | "tablet" | "computador" {
  if (!window.matchMedia("(pointer: coarse)").matches) return "computador";
  return Math.min(window.screen.width, window.screen.height) < 600 ? "celular" : "tablet";
}

function origem(): string {
  try {
    if (!document.referrer) return "";
    const host = new URL(document.referrer).hostname.replace(/^www\./, "");
    // Navegar dentro do próprio site não é "origem".
    return host === location.hostname.replace(/^www\./, "") ? "" : host;
  } catch {
    return "";
  }
}

function novoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function Tracker() {
  useEffect(() => {
    if (navigator.webdriver) return;
    try {
      if (localStorage.getItem("coda-nao-contar") === "1") return;
    } catch {
      // Armazenamento bloqueado: segue contando, só sem a exclusão do dono.
    }

    let id: string;
    let acumulado = 0;
    try {
      id = sessionStorage.getItem(K_ID) || novoId();
      sessionStorage.setItem(K_ID, id);
      // Recarregar a página continua a mesma visita, com o tempo somado.
      acumulado = Number(sessionStorage.getItem(K_MS)) || 0;
    } catch {
      id = novoId();
    }

    const dados = { caminho: location.pathname, origem: origem(), dispositivo: dispositivo() };
    let ultimoEnviado = -1;

    function enviar(saindo: boolean) {
      const ms = Math.round(acumulado);
      // Nada mudou desde o último envio: não gasta requisição nem cota.
      if (ms === ultimoEnviado) return;
      ultimoEnviado = ms;
      const corpo = JSON.stringify({ id, ms, ...dados });
      if (saindo && navigator.sendBeacon) {
        // sendBeacon sobrevive ao fechamento da aba; fetch comum não.
        navigator.sendBeacon(ENDPOINT, new Blob([corpo], { type: "application/json" }));
      } else {
        fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: corpo,
          keepalive: true,
        }).catch(() => {});
      }
    }

    let ultimaAtividade = performance.now();
    const marcarAtividade = () => {
      ultimaAtividade = performance.now();
    };
    const eventos = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;
    eventos.forEach((ev) => window.addEventListener(ev, marcarAtividade, { passive: true }));

    let anterior = performance.now();
    const relogio = window.setInterval(() => {
      const agora = performance.now();
      // Limitado a 2s: se o navegador congelar o timer (aba em segundo plano,
      // máquina suspensa), a volta não credita o tempo parado de uma vez.
      const delta = Math.min(agora - anterior, 2000);
      anterior = agora;
      if (document.visibilityState === "visible" && agora - ultimaAtividade < OCIOSO_MS) {
        acumulado += delta;
        try {
          sessionStorage.setItem(K_MS, String(Math.round(acumulado)));
        } catch {}
      }
    }, 1000);

    // Batimento periódico: no celular, o navegador às vezes mata a aba sem
    // disparar nenhum evento de saída, e o último batimento é o que fica.
    const batimento = window.setInterval(() => enviar(false), BATIMENTO_MS);

    const aoMudarVisibilidade = () => {
      if (document.visibilityState === "hidden") {
        enviar(true);
      } else {
        anterior = performance.now();
        marcarAtividade();
      }
    };
    const aoSair = () => enviar(true);
    document.addEventListener("visibilitychange", aoMudarVisibilidade);
    window.addEventListener("pagehide", aoSair);

    // Primeiro envio imediato: até quem sai em 2 segundos conta como visita.
    enviar(false);

    return () => {
      window.clearInterval(relogio);
      window.clearInterval(batimento);
      eventos.forEach((ev) => window.removeEventListener(ev, marcarAtividade));
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
      window.removeEventListener("pagehide", aoSair);
    };
  }, []);

  return null;
}
