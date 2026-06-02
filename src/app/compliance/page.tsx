import type { Metadata } from "next";
import PublicPage from "@/components/PublicPage";

export const metadata: Metadata = {
  title: "Compliance",
  description:
    "FlowCheck AI+ Compliance: EU AI Act, §14 UStG, GoBD und DSGVO. Transparente KI-Nutzung in der Rechnungsverarbeitung.",
};

const SECTIONS: { title: string; body: string; points: string[] }[] = [
  {
    title: "EU AI Act",
    body: "FlowCheck AI+ setzt KI als unterstützendes Werkzeug ein — die finale Entscheidung trifft immer ein Mensch.",
    points: [
      "Risikoklasse: begrenztes Risiko (Transparenzpflichten)",
      "Mensch-in-der-Schleife bei jeder Freigabe",
      "Nachvollziehbare KI-Vorschläge mit Konfidenzwerten",
      "Keine vollautomatischen finanziellen Entscheidungen ohne Bestätigung",
    ],
  },
  {
    title: "§14 UStG — Pflichtangaben",
    body: "Jede Rechnung wird automatisch auf die umsatzsteuerlichen Pflichtangaben geprüft.",
    points: [
      "Vollständiger Name & Anschrift von Leistendem und Empfänger",
      "Steuernummer oder USt-IdNr.",
      "Rechnungsdatum & fortlaufende Rechnungsnummer",
      "Entgelt, Steuersatz und Steuerbetrag",
    ],
  },
  {
    title: "GoBD",
    body: "Grundsätze zur ordnungsmäßigen Führung und Aufbewahrung von Büchern in elektronischer Form.",
    points: [
      "Unveränderbarkeit durch Hash-gesicherte Ablage",
      "Vollständigkeit & Nachvollziehbarkeit",
      "Maschinelle Auswertbarkeit",
      "Revisionssicherer Audit-Trail",
    ],
  },
  {
    title: "DSGVO",
    body: "Datenschutz nach europäischem Recht — verarbeitet ausschließlich in Deutschland.",
    points: [
      "Auftragsverarbeitung nach Art. 28 DSGVO",
      "AVV als Bestandteil des Vertrags",
      "Recht auf Auskunft, Löschung und Datenübertragbarkeit",
      "Technische & organisatorische Maßnahmen (TOM)",
    ],
  },
];

export default function CompliancePage() {
  return (
    <PublicPage
      title="Compliance"
      subtitle="Rechtssichere Rechnungsverarbeitung — von der KI-Transparenz bis zur revisionssicheren Archivierung."
    >
      <div className="space-y-6">
        {SECTIONS.map((s) => (
          <section key={s.title} className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-stone-200/60">
            <h2 className="text-xl font-semibold text-[#003856]">{s.title}</h2>
            <p className="mt-2 text-sm text-stone-600">{s.body}</p>
            <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {s.points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-stone-600">
                  <span className="mt-0.5 font-semibold text-[#c8985a]">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PublicPage>
  );
}
