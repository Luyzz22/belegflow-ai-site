import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FlowCheck AI+ — KI-Rechnungsverarbeitung für den Mittelstand",
    template: "%s | FlowCheck AI+",
  },
  description:
    "Eingangsrechnungen automatisch prüfen, freigeben und DATEV-ready exportieren. KI-native. Hosting Deutschland. DSGVO-konform.",
  keywords: [
    "Rechnungsverarbeitung",
    "E-Rechnung",
    "KI Buchhaltung",
    "DATEV Export",
    "GoBD",
    "§14 UStG",
    "Eingangsrechnung",
    "Freigabe-Workflow",
    "FlowCheck",
  ],
  authors: [{ name: "SBS Deutschland GmbH & Co. KG" }],
  metadataBase: new URL("https://belegflow-ai.de"),
  openGraph: {
    title: "FlowCheck AI+ — KI-native Rechnungsverarbeitung",
    description:
      "Eingangsrechnungen automatisch prüfen, freigeben und DATEV-bereit machen. Hosting in Deutschland, DSGVO- & GoBD-konform.",
    url: "https://belegflow-ai.de",
    siteName: "FlowCheck AI+",
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowCheck AI+ — KI-native Rechnungsverarbeitung",
    description: "Eingangsrechnungen automatisch prüfen, freigeben und DATEV-bereit machen.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Inter wird per <link> geladen, damit der Build nicht von einem Font-Fetch zur Build-Zeit abhängt. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#003856" />
      </head>
      <body>{children}</body>
    </html>
  );
}
