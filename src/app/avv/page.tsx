import type { Metadata } from "next";
import PublicPage from "@/components/PublicPage";

export const metadata: Metadata = {
  title: "Auftragsverarbeitungsvereinbarung (AVV)",
  description: "Auftragsverarbeitungsvereinbarung nach Art. 28 DSGVO für FlowCheck AI+.",
};

const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: "1. Gegenstand und Dauer",
    p: [
      "Diese Vereinbarung regelt die Verarbeitung personenbezogener Daten durch die SBS Deutschland GmbH & Co. KG (Auftragsverarbeiter) im Auftrag des Kunden (Verantwortlicher) im Rahmen der Nutzung von FlowCheck AI+.",
      "Die Vereinbarung gilt für die Laufzeit des Hauptvertrags.",
    ],
  },
  {
    h: "2. Art und Zweck der Verarbeitung",
    p: [
      "Verarbeitet werden Daten aus Eingangsrechnungen (u. a. Lieferantendaten, Beträge, Steuerangaben) zum Zweck der automatisierten Rechnungsprüfung, Freigabe und des DATEV-Exports.",
    ],
  },
  {
    h: "3. Ort der Verarbeitung",
    p: [
      "Die Verarbeitung erfolgt ausschließlich in Rechenzentren innerhalb der Bundesrepublik Deutschland. Eine Übermittlung in Drittländer findet nicht statt.",
    ],
  },
  {
    h: "4. Technische und organisatorische Maßnahmen",
    p: [
      "Der Auftragsverarbeiter trifft geeignete TOM nach Art. 32 DSGVO, u. a. Verschlüsselung (TLS 1.3 / AES-256), Zugriffskontrolle, Protokollierung und revisionssichere Archivierung.",
    ],
  },
  {
    h: "5. Unterauftragsverhältnisse",
    p: [
      "Der Einsatz von Unterauftragsverarbeitern erfolgt nur mit dokumentierter Zustimmung des Verantwortlichen und unter Sicherstellung gleichwertiger Datenschutzpflichten.",
    ],
  },
  {
    h: "6. Rechte der betroffenen Personen",
    p: [
      "Der Auftragsverarbeiter unterstützt den Verantwortlichen bei der Erfüllung der Betroffenenrechte (Auskunft, Berichtigung, Löschung, Datenübertragbarkeit).",
    ],
  },
];

export default function AvvPage() {
  return (
    <PublicPage
      title="Auftragsverarbeitungsvereinbarung"
      subtitle="Nach Art. 28 DSGVO — Bestandteil des Vertrags mit FlowCheck AI+."
      narrow
    >
      <div className="space-y-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200/60">
        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h2 className="text-lg font-semibold text-[#003856]">{s.h}</h2>
            {s.p.map((para, i) => (
              <p key={i} className="mt-2 text-sm leading-relaxed text-stone-600">
                {para}
              </p>
            ))}
          </section>
        ))}
        <p className="border-t border-stone-100 pt-6 text-xs text-stone-400">
          Hinweis: Dieser Mustertext ersetzt keine individuelle Rechtsberatung. Die verbindliche, unterschriebene
          Fassung erhalten Sie im Rahmen des Vertragsabschlusses.
        </p>
      </div>
    </PublicPage>
  );
}
