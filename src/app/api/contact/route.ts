import { NextResponse } from "next/server";

/**
 * Placeholder handler — validates the payload and returns success.
 * Wire this to a real email/CRM service (e.g. Resend, HubSpot) before launch;
 * see the README for where to add the API key and provider call.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.name !== "string" ||
    !body.name.trim() ||
    typeof body.email !== "string" ||
    !body.email.trim()
  ) {
    return NextResponse.json({ ok: false, error: "Nome e e-mail são obrigatórios." }, { status: 400 });
  }

  // TODO: send email / push to CRM here.
  console.log("[contact] new lead:", body);

  return NextResponse.json({ ok: true });
}
