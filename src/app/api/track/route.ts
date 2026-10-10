import { NextResponse } from "next/server";
import { analyticsConfigurado, registrarBatimento, type Dispositivo } from "@/lib/analytics/store";

/**
 * Recebe os batimentos do rastreador (src/components/analytics/Tracker.tsx).
 *
 * Responde sempre sem corpo e nunca mostra erro a quem está navegando: um
 * problema aqui não pode atrapalhar a visita. Quem precisa saber que algo
 * está errado é o dono do site, e o painel em /painel diz isso na cara.
 *
 * O IP é lido só para o limite de envios, em memória, e nunca é gravado.
 */

export const runtime = "nodejs";

const ID_RE = /^[a-z0-9-]{8,64}$/i;
/** Seis horas: acima disso é lixo ou abuso, não uma visita. */
const MAX_MS = 6 * 60 * 60 * 1000;
const DISPOSITIVOS: Dispositivo[] = ["celular", "tablet", "computador"];
const BOT_RE =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|lighthouse|headless|curl|wget|python|axios|node-fetch|go-http/i;

/**
 * Limite por IP, melhor-esforço (memória do processo, como o da rota de
 * contato). Uma visita normal manda um batimento a cada 15s — 40 em 10
 * minutos. 200 deixa folga para várias abas e corta script inflando números.
 */
const JANELA_MS = 10 * 60 * 1000;
const MAX_POR_JANELA = 200;
const recentes = new Map<string, number[]>();

function limitado(ip: string): boolean {
  const agora = Date.now();
  const lista = (recentes.get(ip) ?? []).filter((t) => agora - t < JANELA_MS);
  lista.push(agora);
  recentes.set(ip, lista);
  if (recentes.size > 5000) {
    for (const [k, v] of recentes) if (v.every((t) => agora - t >= JANELA_MS)) recentes.delete(k);
  }
  return lista.length > MAX_POR_JANELA;
}

const vazio = (status = 204) => new NextResponse(null, { status });

function texto(v: unknown, max: number): string {
  return typeof v === "string" ? v.slice(0, max) : "";
}

export async function POST(request: Request) {
  if (!analyticsConfigurado()) return vazio(503);
  if (BOT_RE.test(request.headers.get("user-agent") ?? "")) return vazio();

  // Só aceita envio do próprio site. Não é segurança forte — um script pode
  // forjar o cabeçalho —, mas tira o lixo trivial vindo de outras páginas.
  const origemReq = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origemReq && host) {
    try {
      if (new URL(origemReq).host !== host) return vazio(403);
    } catch {
      return vazio(403);
    }
  }

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "?";
  if (limitado(ip)) return vazio(429);

  // sendBeacon pode chegar como text/plain; lê como texto e interpreta.
  let corpo: Record<string, unknown>;
  try {
    corpo = JSON.parse(await request.text());
  } catch {
    return vazio(400);
  }

  const id = texto(corpo.id, 64);
  const ms = Number(corpo.ms);
  if (!ID_RE.test(id) || !Number.isFinite(ms) || ms < 0 || ms > MAX_MS) return vazio(400);

  const caminho = texto(corpo.caminho, 200);
  const dispositivo = DISPOSITIVOS.includes(corpo.dispositivo as Dispositivo)
    ? (corpo.dispositivo as Dispositivo)
    : "computador";
  // Só um nome de domínio; qualquer outra coisa vira "acesso direto".
  const origem = /^[a-z0-9.-]{1,200}$/i.test(texto(corpo.origem, 200)) ? texto(corpo.origem, 200).toLowerCase() : "";
  const paisCab = request.headers.get("x-vercel-ip-country") ?? "";
  const pais = /^[A-Z]{2}$/.test(paisCab) ? paisCab : "";

  try {
    await registrarBatimento(id, ms, {
      caminho: caminho.startsWith("/") ? caminho : "/",
      origem,
      dispositivo,
      pais,
    });
  } catch (err) {
    console.error("[visitas] falha ao gravar batimento:", err);
    return vazio(502);
  }
  return vazio();
}
