import { NextResponse } from "next/server";
import { COOKIE_PAINEL } from "@/lib/analytics/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const res = NextResponse.redirect(new URL("/painel", request.url), 303);
  res.cookies.delete(COOKIE_PAINEL);
  return res;
}
