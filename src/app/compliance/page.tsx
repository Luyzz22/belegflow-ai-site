import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import PublicPage from "@/components/PublicPage";

export const metadata: Metadata = {
  title: "Compliance",
  description:
    "FlowCheck AI+ Compliance: GoBD 2025, EU AI Act, KoSIT-Validierung (EN 16931), §14 UStG, E-Rechnungspflicht 2025/2027/2028 und DSGVO — vollständige Compliance-Übersicht.",
};

const SECTIONS: { title: string; badge?: string; body: string; points: string[] }[] = [
  {
    title: "GoBD 2025",
    badge: "Aktualisiert",
    body: "Die GoBD wurden mit BMF-Schreiben 2025 angepasst. FlowCheck AI+ berücksichtigt die neuen Anforderungen zur elektronischen Rechnungsverarbeitung.",
    points: [
      "Strukturierter Datenteil (XRechnung/ZUGFeRD) reicht zur Archivierung — kein separates Bild-Dokument erforderlich",
      "Z2-Datenzugriff: maschinelle Auswertbarkeit bei Betriebsprüfungen sichergestellt",
      "Unveränderbarkeit durch SHA-256-Hash-gesicherte Ablage",
      "Vollständige Protokollierung aller Verarbeitungsschritte im Audit-Trail (invoice_events)",
      "Revisionssichere Archivierung nach § 147 AO (10 Jahre)",
      "Maschinelle Auswertbarkeit und Vollständigkeit gewährleistet",
    ],
  },
  {
    title: "E-Rechnungspflicht — Fristen",
    badge: "Pflicht seit 2025",
    body: "Das Wachstumschancengesetz (§ 14 UStG) stuft die Empfangspflicht und die gestaffelte Ausstellungspflicht für B2B-Umsätze im Inland verbindlich.",
    points: [
      "Seit 01.01.2025: Empfangspflicht für alle inländischen Unternehmen (keine Übergangsfrist)",
      "Phase 2 ab 01.01.2027: Ausstellungspflicht für Unternehmen mit Vorjahresumsatz 2026 > 800.000 €",
      "Phase 3 ab 01.01.2028: Ausstellungspflicht für alle inländischen B2B-Unternehmen",
      "Ausnahmen: Kleinbetragsrechnungen ≤ 250 €, B2C, Kleinunternehmer § 19 UStG",
      "FlowCheck AI+: XRechnung 3.0 Generator + ZUGFeRD 2.1 Generator + KoSIT-Validierung — sofortige Compliance ohne Implementierungsprojekt",
    ],
  },
  {
    title: "KoSIT-Validierung — EN 16931",
    badge: "EN 16931 · XRechnung 3.0",
    body: "Der integrierte KoSIT-Validator prüft jede erzeugte XRechnung und ZUGFeRD-Datei auf EN-16931-Konformität — direkt im System, ohne externe Tools.",
    points: [
      "Validierungsergebnis: Valid: true, Errors: 0 — maschinell verarbeitbar",
      "XRechnung 3.0 und ZUGFeRD 2.1 / Factur-X vollständig unterstützt",
      "UBL 2.1 und UN/CEFACT CII Syntax konform",
      "Validierung vor dem Versand — keine ungültigen E-Rechnungen an Lieferanten",
      "Validierungsprotokoll als revisionssicherer Nachweis",
    ],
  },
  {
    title: "EU AI Act",
    body: "FlowCheck AI+ setzt KI als unterstützendes Werkzeug ein — die finale Entscheidung trifft immer ein Mensch (Human-in-the-Loop).",
    points: [
      "Risikoklasse: begrenztes Risiko — Transparenzpflichten nach Art. 50",
      "Mensch-in-der-Schleife bei jeder Freigabe — keine automatischen Zahlungsauslösungen",
      "Nachvollziehbare KI-Vorschläge mit Confidence-Score und erklärbarem Reasoning",
      "KI-Transparenz: welches Modell (Gemini 2.5 Flash / Claude Sonnet 4), welche Kosten",
      "Zero Data Retention bei Anthropic — keine Modell-Trainierung mit Kundendaten",
    ],
  },
  {
    title: "§14 UStG — Pflichtangaben",
    body: "Jede Rechnung wird automatisch auf die umsatzsteuerlichen Pflichtangaben geprüft — bei Eingang und bei Ausgang.",
    points: [
      "Vollständiger Name & Anschrift von Leistendem und Empfänger",
      "Steuernummer oder USt-IdNr. des Leistenden",
      "Rechnungsdatum & fortlaufende Rechnungsnummer",
      "Menge und handelsübliche Bezeichnung der Leistung",
      "Entgelt, Steuersatz und Steuerbetrag (oder Steuerbefreiungshinweis)",
    ],
  },
  {
    title: "DSGVO",
    body: "Datenschutz nach europäischem Recht — verarbeitet ausschließlich in deutschen Rechenzentren.",
    points: [
      "Auftragsverarbeitung nach Art. 28 DSGVO — AVV als One-Click-Download unter /avv",
      "Technisch-organisatorische Maßnahmen (TOM) unter /trust/tom dokumentiert",
      "Recht auf Auskunft, Löschung und Datenübertragbarkeit",
      "Löschkonzept nach GoBD-Fristen und § 17 DSGVO",
      "Sub-Processor-Transparenz: Anthropic (USA, SCC), Hetzner (DE), Neon (DE)",
    ],
  },
];

const COMPLIANCE_STATUS: [string, string, string][] = [
  ["GoBD 2025", "✅ Konform", "SHA-256, Audit-Trail, 10 J. Aufbewahrung"],
  ["E-Rechnungspflicht", "✅ Sofort-Compliance", "XRechnung 3.0 + ZUGFeRD 2.1 + KoSIT"],
  ["EU AI Act", "✅ Ready", "Art. 50, Human-in-the-Loop, Confidence-Score"],
  ["§14 UStG", "✅ Automatisch", "Pflichtangaben-Prüfung bei Eingang & Ausgang"],
  ["DSGVO", "✅ Konform", "AVV, TOM, Löschkonzept, Sub-Processor-Liste"],
  ["NIS2", "✅ Ready", "Incident-Response-Plan vorhanden"],
  ["ISO 27001", "📋 Roadmap", "Zertifizierung geplant"],
];

export default function CompliancePage() {
  return (
    <PublicPage
      title="Compliance"
      subtitle="Rechtssichere Rechnungsverarbeitung — GoBD 2025, KoSIT EN 16931, E-Rechnungspflicht und EU AI Act."
    >
      {/* Schnellübersicht */}
      <div className="mb-8 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/60">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-left text-xs font-medium uppercase tracking-wider text-stone-400">
              <th className="px-4 py-3">Norm</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {COMPLIANCE_STATUS.map(([norm, status, details]) => (
              <tr key={norm} className="hover:bg-stone-50/50">
                <td className="px-4 py-2.5 font-semibold text-[#003856]">{norm}</td>
                <td className="px-4 py-2.5 font-medium text-emerald-700">{status}</td>
                <td className="px-4 py-2.5 text-stone-500">{details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-5">
        {SECTIONS.map((s) => (
          <section key={s.title} className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-stone-200/60">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-[#003856]">{s.title}</h2>
              {s.badge && (
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {s.badge}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-stone-600">{s.body}</p>
            <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {s.points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-stone-600">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {p}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Weiterführende Links */}
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/avv"
          className="inline-flex items-center gap-2 rounded-xl border border-[#003856]/15 bg-white px-4 py-2.5 text-sm font-medium text-[#003856] shadow-sm transition hover:bg-[#003856]/5"
        >
          AVV nach Art. 28 DSGVO <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/trust"
          className="inline-flex items-center gap-2 rounded-xl border border-[#003856]/15 bg-white px-4 py-2.5 text-sm font-medium text-[#003856] shadow-sm transition hover:bg-[#003856]/5"
        >
          Trust Center & TOM <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/wissen/e-rechnungspflicht"
          className="inline-flex items-center gap-2 rounded-xl border border-[#003856]/15 bg-white px-4 py-2.5 text-sm font-medium text-[#003856] shadow-sm transition hover:bg-[#003856]/5"
        >
          E-Rechnungspflicht: Fristen & Details <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <p className="mt-8 text-sm text-stone-500">
        Compliance-Fragen?{" "}
        <a href="mailto:ki@sbsdeutschland.de" className="font-medium text-[#003856] hover:underline">
          ki@sbsdeutschland.de
        </a>{" "}
        — Antwort innerhalb von 24 Stunden.
      </p>
    </PublicPage>
  );
}
