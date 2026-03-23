import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Häufige Fragen zu DATEV-kompatiblem Export, XRechnung/ZUGFeRD, KoSIT-Validierung, GoBD-orientierter Prüfspur, KI-Kontierung, AVV und API.",
};

const faqItems = [
  {
    q: "Was bedeutet DATEV-kompatibler Export?",
    a: "DATEV-kompatibel bedeutet, dass Exportformate für die Weiterverarbeitung in DATEV-nahen Workflows ausgelegt sind. Es ist kein pauschaler Zertifizierungs-Claim. Fachliche Abnahme im Zielprozess bleibt empfohlen (steuerlich validieren).",
  },
  {
    q: "Unterstützt ihr XRechnung und ZUGFeRD?",
    a: "Die Plattform verarbeitet strukturierte E-Rechnungsformate wie XRechnung und ZUGFeRD im Workflow-Kontext. Detailanforderungen sollten je Anwendungsfall verifiziert werden (Claim nur nach technischer Bestätigung veröffentlichen).",
  },
  {
    q: "Was bedeutet KoSIT-Validierung konkret?",
    a: "KoSIT-Validierung beschreibt formale Prüfungen gegen relevante Regeln für strukturierte E-Rechnungen. Sie unterstützt die technische Validierung, ersetzt aber keine juristische Gesamtbewertung.",
  },
  {
    q: "Ist das GoBD-konform?",
    a: "Wir sprechen bewusst von einer GoBD-orientierten Prüfspur mit nachvollziehbaren Events/Audit-Trail. Eine formale Gesamtbewertung hängt vom konkreten Prozess und dessen organisatorischer Umsetzung ab (juristisch prüfen / steuerlich validieren).",
  },
  {
    q: "Wie funktioniert die KI-Kontierung?",
    a: "Die KI erstellt Kontierungsvorschläge nach SKR03/SKR04 mit Begründung und Confidence. Vorschläge dienen als Entscheidungshilfe und müssen fachlich geprüft werden.",
  },
  {
    q: "Können Vorschläge geprüft und korrigiert werden?",
    a: "Ja. KI-Vorschläge sind im Review-Prozess prüf- und korrigierbar, bevor Freigabe oder Export erfolgt.",
  },
  {
    q: "Wie werden Daten verarbeitet?",
    a: "Rechnungsdaten werden für Upload, Verarbeitung, Validierung, Workflow und Export verarbeitet. Datenschutzrollen, TOMs und Auftragsverarbeitung werden im Vertragsprozess transparent gemacht (DSB prüfen).",
  },
  {
    q: "Gibt es einen AVV?",
    a: "Ja, AVV-Unterlagen können im Beschaffungsprozess angefordert werden. Bis zur finalen Freigabe gelten Entwurfsdokumente als juristisch zu prüfen.",
  },
  {
    q: "Gibt es eine API?",
    a: "Ja. Es gibt eine API-Dokumentation mit Swagger sowie OpenAPI-Definition für technische Prüfungen und Integrationen.",
  },
  {
    q: "Für welche Unternehmensgrößen ist das geeignet?",
    a: "Der Fokus liegt auf mittelständischen Unternehmen und wachsenden Finance-Teams. Für sehr spezielle Anforderungen empfiehlt sich ein Pilot-Setup mit klaren Akzeptanzkriterien.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d4d4d4]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="max-w-4xl mx-auto px-6 py-14">
        <Link href="/" className="text-sm text-[#e85d04] hover:text-[#f48c06]">← Startseite</Link>
        <h1 className="text-4xl text-white mt-4 mb-3" style={{fontFamily:"'Instrument Serif',serif"}}>FAQ</h1>
        <p className="text-[#a3a3a3] mb-8">Präzise Antworten für Finance, IT, Datenschutz und Einkauf — defensiv formuliert für belastbare Beschaffungsentscheidungen.</p>

        <div className="space-y-3">
          {faqItems.map((item) => (
            <article key={item.q} className="bg-[#171717]/60 border border-[#262626] rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white mb-2">{item.q}</h2>
              <p className="text-sm text-[#a3a3a3]">{item.a}</p>
            </article>
          ))}
        </div>

        <section className="mt-8 border border-[#262626] rounded-xl p-6">
          <h2 className="text-lg text-white mb-3" style={{fontFamily:"'Instrument Serif',serif"}}>Nächste Schritte</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/kontakt" className="px-4 py-2 bg-[#e85d04] rounded-lg text-sm text-white hover:bg-[#f48c06] transition">Demo anfragen</Link>
            <Link href="/compliance" className="px-4 py-2 border border-[#303030] rounded-lg text-sm hover:border-[#e85d04]/60 transition">Compliance</Link>
            <Link href="/api-docs" className="px-4 py-2 border border-[#303030] rounded-lg text-sm hover:border-[#e85d04]/60 transition">API / OpenAPI</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
