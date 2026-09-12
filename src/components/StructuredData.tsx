import { brand, services } from "@/lib/content";
import { siteUrl } from "@/lib/site";

/**
 * JSON-LD so Google can read who CODA is, what it sells and how to reach it,
 * instead of inferring it from the copy. Everything here mirrors data that is
 * already visible on the page — when you fix the placeholder e-mail, phone and
 * social links in `content.ts`, this block follows automatically.
 */
export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteUrl}/#organization`,
    name: brand.name,
    url: siteUrl,
    description: brand.positioning,
    slogan: brand.tagline,
    image: `${siteUrl}/opengraph-image`,
    logo: `${siteUrl}/icon.svg`,
    email: brand.email,
    telephone: brand.phone,
    areaServed: { "@type": "Country", name: "Brasil" },
    sameAs: brand.social.map((s) => s.href),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Serviços",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.title,
          description: service.description,
        },
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      // The object is built here from our own content file, never from user
      // input, so there is nothing to escape beyond closing-tag safety.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
