import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://belegflow-ai.de";
  const now = new Date();
  const routes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "", priority: 1, freq: "weekly" },
    { path: "/preise", priority: 0.9, freq: "monthly" },
    { path: "/e-rechnung-pruefen", priority: 0.9, freq: "monthly" },
    { path: "/wissen", priority: 0.8, freq: "monthly" },
    { path: "/wissen/e-rechnungspflicht", priority: 0.8, freq: "monthly" },
    { path: "/wissen/xrechnung-fehler", priority: 0.8, freq: "monthly" },
    { path: "/wissen/pruefkatalog", priority: 0.7, freq: "monthly" },
    { path: "/wissen/xrechnung-vs-zugferd", priority: 0.6, freq: "monthly" },
    { path: "/trust", priority: 0.8, freq: "monthly" },
    { path: "/status", priority: 0.5, freq: "daily" },
    { path: "/trust/tom", priority: 0.4, freq: "yearly" },
    { path: "/trust/avv", priority: 0.4, freq: "yearly" },
    { path: "/sicherheit", priority: 0.7, freq: "monthly" },
    { path: "/compliance", priority: 0.7, freq: "monthly" },
    { path: "/kontakt", priority: 0.6, freq: "monthly" },
    { path: "/login", priority: 0.4, freq: "yearly" },
    { path: "/register", priority: 0.5, freq: "yearly" },
    { path: "/forgot-password", priority: 0.2, freq: "yearly" },
    { path: "/avv", priority: 0.3, freq: "yearly" },
    { path: "/impressum", priority: 0.3, freq: "yearly" },
    { path: "/datenschutz", priority: 0.3, freq: "yearly" },
    { path: "/agb", priority: 0.3, freq: "yearly" },
  ];
  return routes.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
