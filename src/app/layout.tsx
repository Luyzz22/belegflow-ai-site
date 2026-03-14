import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BelegFlow AI — Intelligente E-Rechnung",
  description: "BelegFlow AI automatisiert Ihre Eingangsrechnungen mit KI. GoBD-konform, DATEV-ready, bereit für die E-Rechnungspflicht 2027.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
