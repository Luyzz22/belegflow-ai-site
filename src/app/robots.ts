import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/rechnungen",
        "/review",
        "/upload",
        "/freigaben",
        "/lieferanten",
        "/export",
        "/zahlungen",
        "/audit",
        "/analytics",
        "/prozesse",
        "/cashflow",
        "/roi",
        "/compliance-center",
        "/report",
        "/einstellungen",
        "/profil",
        "/api",
      ],
    },
    sitemap: "https://belegflow-ai.de/sitemap.xml",
  };
}
