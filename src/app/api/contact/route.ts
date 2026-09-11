import { NextResponse } from "next/server";

/**
 * Placeholder handler — validates the payload and returns success.
 * Wire this to a real email/CRM service (e.g. Resend, HubSpot) before launch;
 * see the README for where to add the API key and provider call.
 *
 * Also add real rate limiting (e.g. Upstash Ratelimit / Vercel KV) at that
 * point — this route has none, since a meaningful limiter needs shared
 * storage this placeholder doesn't have. The length caps and CRLF strip
 * below are just to keep a spam payload from blowing up logs and to stop
 * classic email-header injection once this is wired to a real send call.
 */
const MAX_LENGTHS = { name: 200, email: 320, company: 200, service: 100, message: 5000 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/[\r\n]+/g, " ").trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
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

  // TODO: send email / push to CRM here.
  console.log("[contact] new lead:", { name, email, company, service, message });

  return NextResponse.json({ ok: true });
}
