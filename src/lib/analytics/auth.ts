import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Acesso ao painel de visitas: uma senha só, definida em PAINEL_SENHA no
 * ambiente de deploy. Sem ela o painel fica desligado — nunca aberto.
 *
 * Quem acerta a senha recebe um cookie httpOnly com uma assinatura derivada
 * dela. Trocar a senha na Vercel invalida todos os acessos já abertos, porque
 * a assinatura antiga deixa de bater.
 */

export const COOKIE_PAINEL = "coda_painel";
export const COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

export function senhaConfigurada(): boolean {
  return Boolean(process.env.PAINEL_SENHA);
}

function assinatura(senha: string): Buffer {
  return createHmac("sha256", senha).update("coda-painel:v1").digest();
}

/** Comparação em tempo constante: o tempo de resposta não revela nada. */
function iguais(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

export function senhaConfere(tentativa: string): boolean {
  const senha = process.env.PAINEL_SENHA;
  if (!senha) return false;
  return iguais(assinatura(tentativa), assinatura(senha));
}

export function valorDoCookie(): string {
  const senha = process.env.PAINEL_SENHA;
  if (!senha) throw new Error("PAINEL_SENHA não definida.");
  return assinatura(senha).toString("hex");
}

export function cookieValido(valor: string | undefined): boolean {
  const senha = process.env.PAINEL_SENHA;
  if (!senha || !valor || !/^[0-9a-f]{64}$/.test(valor)) return false;
  return iguais(Buffer.from(valor, "hex"), assinatura(senha));
}
