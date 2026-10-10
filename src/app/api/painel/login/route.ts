import { NextResponse } from "next/server";
import { COOKIE_MAX_AGE, COOKIE_PAINEL, senhaConfere, senhaConfigurada, valorDoCookie } from "@/lib/analytics/auth";

/**
 * Login do painel. Recebe o formulário de /painel (funciona sem JavaScript)
 * e devolve um redirecionamento 303 de volta para ele.
 */

export const runtime = "nodejs";

/** Tentativas por IP, em memória: 8 a cada 15 minutos freia adivinhação. */
const JANELA_MS = 15 * 60 * 1000;
const MAX_TENTATIVAS = 8;
const tentativas = new Map<string, number[]>();

function bloqueado(ip: string): boolean {
  const agora = Date.now();
  const lista = (tentativas.get(ip) ?? []).filter((t) => agora - t < JANELA_MS);
  tentativas.set(ip, lista);
  return lista.length >= MAX_TENTATIVAS;
}

function registrarFalha(ip: string) {
  tentativas.set(ip, [...(tentativas.get(ip) ?? []), Date.now()]);
}

const voltar = (request: Request, query = "") =>
  NextResponse.redirect(new URL(`/painel${query}`, request.url), 303);

export async function POST(request: Request) {
  if (!senhaConfigurada()) return voltar(request);

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "?";
  if (bloqueado(ip)) return voltar(request, "?erro=limite");

  const form = await request.formData().catch(() => null);
  const senha = typeof form?.get("senha") === "string" ? (form!.get("senha") as string) : "";

  if (!senhaConfere(senha)) {
    registrarFalha(ip);
    return voltar(request, "?erro=senha");
  }

  tentativas.delete(ip);
  const res = voltar(request);
  res.cookies.set(COOKIE_PAINEL, valorDoCookie(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}
