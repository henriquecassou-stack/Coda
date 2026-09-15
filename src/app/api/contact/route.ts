import { NextResponse } from "next/server";
import { brand } from "@/lib/content";

/**
 * Recebe o formulário da seção "Vamos conversar" e envia por e-mail.
 *
 * O envio é feito pela API HTTP da Resend com `fetch` — sem SDK, porque a
 * chamada é uma requisição só e um pacote a mais aqui é um pacote a mais para
 * manter. Três variáveis de ambiente mandam no comportamento (veja
 * `.env.example` e a seção "Formulário de contato" do README):
 *
 * - `RESEND_API_KEY`     — obrigatória. Sem ela a rota responde 503 e o
 *                          visitante vê um recado pedindo para usar o e-mail
 *                          ou o WhatsApp. É de propósito: antes disso a rota
 *                          respondia "enviado" sem enviar nada, e um lead
 *                          perdido em silêncio é pior que um erro visível.
 * - `CONTACT_TO_EMAIL`   — para onde vai. Padrão: o e-mail da marca.
 * - `CONTACT_FROM_EMAIL` — quem assina. Padrão: o remetente de testes da
 *                          Resend, que só entrega na caixa dona da conta.
 *                          Com domínio próprio verificado, troque por algo
 *                          como `CODA <contato@seudominio.com.br>`.
 *
 * O `reply_to` é o e-mail de quem preencheu: responder na sua caixa responde
 * para a pessoa, sem copiar endereço na mão.
 */

export const runtime = "nodejs";

const MAX_LENGTHS = { name: 200, email: 320, company: 200, service: 100, message: 5000 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Limite de envios por IP. É melhor-esforço, e isso é uma escolha declarada:
 * vive na memória do processo, então não é compartilhado entre instâncias nem
 * sobrevive a um cold start. Não é defesa contra um ataque decidido — para
 * isso é preciso armazenamento compartilhado (Upstash Ratelimit, Vercel KV).
 * O que ele contém é o caso comum, um script bobo ou um dedo nervoso
 * repetindo o envio, que agora custa cota de e-mail e enche a caixa.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recentByIp = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (recentByIp.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    recentByIp.set(ip, recent);
    return true;
  }
  recent.push(now);
  recentByIp.set(ip, recent);
  // Sem isso o Map só cresce num processo de vida longa: cada IP que passou
  // por aqui uma vez ficaria guardado para sempre.
  if (recentByIp.size > 5000) {
    for (const [chave, marcas] of recentByIp) {
      if (marcas.every((t) => now - t >= WINDOW_MS)) recentByIp.delete(chave);
    }
  }
  return false;
}

function cleanString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/[\r\n]+/g, " ").trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
}

/** O corpo do e-mail é HTML e os campos vêm de um formulário público. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Payload inválido." }, { status: 400 });
  }

  const name = cleanString(body.name, MAX_LENGTHS.name);
  const email = cleanString(body.email, MAX_LENGTHS.email);
  if (!name || !email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Nome e e-mail válidos são obrigatórios." }, { status: 400 });
  }

  const company = cleanString(body.company, MAX_LENGTHS.company) ?? "";
  const service = cleanString(body.service, MAX_LENGTHS.service) ?? "";
  const message = cleanString(body.message, MAX_LENGTHS.message) ?? "";

  // `x-forwarded-for` é uma lista; o primeiro endereço é o do cliente.
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "desconhecido";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Muitas mensagens em pouco tempo. Tente de novo mais tarde ou chame no WhatsApp." },
      { status: 429 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || brand.email;
  const from = process.env.CONTACT_FROM_EMAIL || `${brand.name} <onboarding@resend.dev>`;

  if (!apiKey) {
    console.error("[contato] RESEND_API_KEY ausente — o formulário não tem para onde enviar.");
    return NextResponse.json(
      { ok: false, error: `Envio indisponível no momento. Escreva para ${brand.email} ou chame no WhatsApp.` },
      { status: 503 },
    );
  }

  const linhas: [string, string][] = [
    ["Nome", name],
    ["E-mail", email],
    ["Empresa", company || "—"],
    ["Serviço de interesse", service || "—"],
  ];

  const text = [
    ...linhas.map(([rotulo, valor]) => `${rotulo}: ${valor}`),
    "",
    "Mensagem:",
    message || "(sem mensagem)",
  ].join("\n");

  const html = [
    `<h2 style="font:600 18px system-ui,sans-serif;margin:0 0 16px">Novo contato pelo site</h2>`,
    `<table style="font:14px system-ui,sans-serif;border-collapse:collapse">`,
    ...linhas.map(
      ([rotulo, valor]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#666">${rotulo}</td><td style="padding:4px 0">${escapeHtml(valor)}</td></tr>`,
    ),
    `</table>`,
    `<p style="font:14px system-ui,sans-serif;margin:16px 0 4px;color:#666">Mensagem</p>`,
    `<p style="font:14px/1.6 system-ui,sans-serif;margin:0;white-space:pre-wrap">${escapeHtml(message || "(sem mensagem)")}</p>`,
  ].join("");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Contato pelo site — ${name}${company ? ` (${company})` : ""}`,
        text,
        html,
      }),
      // Sem timeout, um provedor lento segura a função até ela ser derrubada e
      // o visitante fica olhando "Enviando..." sem fim.
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const detalhe = await res.text().catch(() => "");
      // O lead vai para o log junto com a falha: é a diferença entre perder o
      // contato e conseguir responder à mão depois.
      console.error("[contato] Resend recusou:", res.status, detalhe.slice(0, 500), { name, email, company, service });
      return NextResponse.json(
        { ok: false, error: `Não conseguimos enviar agora. Escreva para ${brand.email}.` },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("[contato] falha ao chamar a Resend:", err, { name, email, company, service });
    return NextResponse.json(
      { ok: false, error: `Não conseguimos enviar agora. Escreva para ${brand.email}.` },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
