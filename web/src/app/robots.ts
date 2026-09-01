import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

// These are built once at build time, never per request. Required
// explicitly under `output: export`, which refuses to guess.
export const dynamic = "force-static";


export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The CRM is not part of the public site and must never be indexed.
      disallow: "/admin",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
