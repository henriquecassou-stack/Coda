import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/**
 * One page today. When real case pages or a blog arrive, add an entry per
 * route here — the file is the whole sitemap, there is nothing else to update.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
