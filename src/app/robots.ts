import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // As rotas de API e o painel de visitas não têm nada para indexar.
      disallow: ["/api/", "/painel"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
