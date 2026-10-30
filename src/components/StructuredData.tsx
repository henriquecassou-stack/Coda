import { brand, services } from "@/lib/content";
import { siteUrl } from "@/lib/site";

/**
 * JSON-LD so Google can read who CODA is, what it sells and how to reach it,
 * instead of inferring it from the copy. Everything here mirrors data that is
 * already visible on the page — when you fix the placeholder e-mail, phone and
 * social links in `content.ts`, this block follows automatically.
 *
 * Nada aqui pode ser inventado: endereço, CNPJ, avaliações, preços e números
 * só entram quando existirem de verdade e estiverem visíveis no site.
 */
export function StructuredData() {
  const orgId = `${siteUrl}/#organization`;

  // `Organization`, e não `ProfessionalService`: este é um subtipo de
  // `LocalBusiness`, e para o Google todo LocalBusiness precisa de `address`.
  // Sem endereço, o bloco aparecia como inválido no Search Console e não
  // rendia nada. Quando houver um endereço real (ou o Perfil da Empresa no
  // Google estiver criado com ele), volte para "ProfessionalService" e
  // acrescente `address` — nunca um endereço inventado.
  const organization = {
    "@type": "Organization",
    "@id": orgId,
    name: brand.name,
    alternateName: "CODA Automações",
    url: `${siteUrl}/`,
    description: brand.positioning,
    slogan: brand.tagline,
    image: `${siteUrl}/opengraph-image`,
    // PNG quadrado de 512px num endereço fixo: o Google exige no mínimo
    // 112x112 e lê raster com mais segurança que SVG.
    logo: `${siteUrl}/logo.png`,
    email: brand.email,
    telephone: brand.phone,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: brand.phone,
      email: brand.email,
      availableLanguage: "Portuguese",
      areaServed: "BR",
    },
    areaServed: { "@type": "Country", name: "Brasil" },
    // `sameAs` é para perfis que representam a empresa (Instagram, LinkedIn).
    // O link do WhatsApp é um canal de contato, já declarado no `contactPoint`.
    sameAs: brand.social.filter((s) => s.icon !== "whatsapp").map((s) => s.href),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Serviços",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
          description: service.description,
          provider: { "@id": orgId },
          areaServed: { "@type": "Country", name: "Brasil" },
        },
      })),
    },
  };

  // O nome que o Google mostra acima do endereço nos resultados ("CODA" em vez
  // de "codaautomacoes.com"). Ele lê isto do bloco WebSite da página inicial.
  const website = {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: brand.name,
    alternateName: ["CODA Automações", "codaautomacoes.com"],
    url: `${siteUrl}/`,
    inLanguage: "pt-BR",
    publisher: { "@id": orgId },
  };

  const data = { "@context": "https://schema.org", "@graph": [website, organization] };

  return (
    <script
      type="application/ld+json"
      // The object is built here from our own content file, never from user
      // input, so there is nothing to escape beyond closing-tag safety.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
