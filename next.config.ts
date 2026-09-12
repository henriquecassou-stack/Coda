import type { NextConfig } from "next";

/**
 * Everything on this site is bundled/self-hosted (next/font, npm-installed
 * GSAP/Lenis — no CDN scripts) and there is no dangerouslySetInnerHTML, eval,
 * or unescaped user content rendered anywhere, so script/style/font/connect
 * are locked to 'self' with no external origins. 'unsafe-inline' stays on
 * script-src only because Next's own hydration bootstrap uses inline
 * scripts it doesn't nonce in this setup — real risk stays low since there
 * is no injection point for attacker-controlled markup to land in the DOM.
 */
// Dev-mode React uses eval() for debugging features (better stack traces,
// component-stack reconstruction) — never in production, per React's own
// console warning. 'unsafe-eval' is added only outside production so the
// dev-server overlay doesn't flag it, without loosening the real CSP.
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
