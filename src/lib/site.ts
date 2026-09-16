/**
 * The site's own absolute URL. Used to build canonical links, the og:image
 * URL, robots.txt, the sitemap and the JSON-LD block — so it lives in one
 * place instead of being re-read from the environment in five files.
 *
 * O padrão é o domínio real, então em produção não é preciso definir nada.
 * `NEXT_PUBLIC_SITE_URL` existe para os casos em que o site roda em outro
 * endereço — a prévia `.vercel.app` antes de o domínio apontar para cá, ou um
 * ambiente de homologação. Nesses casos vale defini-la: sem isso o canonical e
 * as prévias do WhatsApp/LinkedIn apontam para o domínio de produção, que
 * ainda não serve aquele conteúdo.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://codaautomacoes.com").replace(/\/$/, "");
