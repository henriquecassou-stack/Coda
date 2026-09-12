/**
 * The site's own absolute URL. Used to build canonical links, the og:image
 * URL, robots.txt, the sitemap and the JSON-LD block — so it lives in one
 * place instead of being re-read from the environment in five files.
 *
 * Set NEXT_PUBLIC_SITE_URL to the real domain in the deploy environment. The
 * fallback only keeps local builds and previews working; shipping with it
 * means WhatsApp and LinkedIn previews point at the wrong host.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://coda.studio").replace(/\/$/, "");
