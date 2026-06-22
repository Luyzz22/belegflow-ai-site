import type { Metadata } from "next";
import PublicPage from "@/components/PublicPage";
import ERechnungCheck from "@/components/erechnung/ERechnungCheck";

export const metadata: Metadata = {
  title: "E-Rechnung prüfen — XRechnung & ZUGFeRD gegen EN 16931 validieren",
  description:
    "Kostenlos und ohne Anmeldung: XRechnung-XML oder ZUGFeRD-/Factur-X-PDF gegen EN 16931 validieren. Syntax, Schema und Geschäftsregeln (KoSIT) prüfen, Fehler verständlich erklärt. Server in Deutschland.",
  keywords: [
    "E-Rechnung prüfen",
    "XRechnung validieren",
    "EN 16931",
    "ZUGFeRD prüfen",
    "XRechnung Fehler",
    "Factur-X",
    "KoSIT Validator",
    "E-Rechnung Validierung",
  ],
  alternates: { canonical: "/e-rechnung-pruefen" },
  openGraph: {
    title: "E-Rechnung prüfen — XRechnung & ZUGFeRD gegen EN 16931",
    description:
      "Kostenlos & ohne Login: XRechnung/ZUGFeRD gegen EN 16931 validieren — mit verständlicher Fehlerliste und lesbarer Rechnungsansicht.",
    url: "/e-rechnung-pruefen",
    type: "website",
  },
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "Was ist eine XRechnung?",
    a: "Die XRechnung ist der deutsche Standard für elektronische Rechnungen im strukturierten XML-Format. Sie erfüllt die europäische Norm EN 16931 und ist bei Rechnungen an öffentliche Auftraggeber verpflichtend.",
  },
  {
    q: "Welche Formate kann ich prüfen?",
    a: "XRechnung als XML (UBL oder CII) sowie ZUGFeRD- bzw. Factur-X-PDFs, bei denen das XML in der PDF/A-3-Datei eingebettet ist. Maximale Dateigröße: 10 MB.",
  },
  {
    q: "Werden meine Dateien gespeichert?",
    a: "Nein. Hochgeladene Dateien werden ausschließlich temporär zur Prüfung verarbeitet und danach verworfen — keine Speicherung, kein Archiv. Die Verarbeitung erfolgt auf Servern in Deutschland.",
  },
  {
    q: "Was wird genau geprüft?",
    a: "Drei Ebenen: die XML-Syntax, das Schema (UBL/CII) und die Geschäftsregeln nach EN 16931 (Schematron, KoSIT). Fehler und Warnungen werden mit Regel-Code, betroffenem Feld (BT/BG) und einer verständlichen Erklärung ausgegeben.",
  },
];

export default function ERechnungPruefenPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "FlowCheck AI+ — E-Rechnung prüfen",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        description:
          "Login-freie Validierung von XRechnung und ZUGFeRD gegen EN 16931 (Syntax, Schema, KoSIT-Geschäftsregeln).",
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <PublicPage
      title="E-Rechnung prüfen — XRechnung & ZUGFeRD gegen EN 16931"
      subtitle="Laden Sie eine XRechnung-XML oder ein ZUGFeRD-/Factur-X-PDF hoch und erhalten Sie sofort ein verständliches Validierungsergebnis — kostenlos und ohne Anmeldung."
    >
      {/* JSON-LD für SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-3xl">
        <ERechnungCheck />
      </div>

      {/* FAQ */}
      <section className="mx-auto mt-16 max-w-3xl">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#003856]">Häufige Fragen</h2>
        <div className="space-y-4">
          {FAQ.map((f) => (
            <div key={f.q} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/60">
              <h3 className="text-base font-semibold text-[#1a1a2e]">{f.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#64748b]">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicPage>
  );
}
