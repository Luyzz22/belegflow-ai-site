import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BelegFlow AI — Intelligente E-Rechnung für den Mittelstand",
    template: "%s | BelegFlow AI",
  },
  description: "BelegFlow AI automatisiert Ihren Rechnungseingang mit KI. GoBD-orientierte Prüfspur, DATEV-kompatibler Export und vorbereitet auf die E-Rechnungs-Pflichten. Kostenlos starten.",
  keywords: ["E-Rechnung", "KI Rechnungsverarbeitung", "DATEV Export", "GoBD", "XRechnung", "ZUGFeRD", "Buchhaltung Automatisierung", "BelegFlow"],
  authors: [{ name: "SBS Deutschland GmbH & Co. KG" }],
  metadataBase: new URL("https://belegflow-ai.de"),
  openGraph: {
    title: "BelegFlow AI — Intelligente E-Rechnung",
    description: "KI-gestützte Rechnungsverarbeitung mit GoBD-orientierter Prüfspur und DATEV-kompatiblem Export.",
    url: "https://belegflow-ai.de",
    siteName: "BelegFlow AI",
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BelegFlow AI — Intelligente E-Rechnung",
    description: "KI-gestützte Rechnungsverarbeitung für den deutschen Mittelstand.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%23e85d04'/><text x='50%' y='55%' font-size='16' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif'>BF</text></svg>" />
      <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#e85d04" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>{children}</body>
    </html>
  );
}
