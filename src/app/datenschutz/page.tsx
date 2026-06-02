import type { Metadata } from "next";
import PublicPage from "@/components/PublicPage";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Datenschutzerklärung von FlowCheck AI+ nach DSGVO — Hosting in Deutschland.",
};

const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: "1. Verantwortlicher",
    p: [
      "Verantwortlich für die Datenverarbeitung ist die SBS Deutschland GmbH & Co. KG. Kontakt: ki@sbsdeutschland.de.",
    ],
  },
  {
    h: "2. Verarbeitete Daten",
    p: [
      "Wir verarbeiten Bestandsdaten (z. B. Name, E-Mail), Nutzungsdaten sowie Inhaltsdaten aus hochgeladenen Rechnungen (Lieferanten, Beträge, Steuerangaben).",
    ],
  },
  {
    h: "3. Zwecke und Rechtsgrundlagen",
    p: [
      "Die Verarbeitung erfolgt zur Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO) sowie zur Erfüllung rechtlicher Pflichten (Art. 6 Abs. 1 lit. c DSGVO), etwa handels- und steuerrechtlicher Aufbewahrungspflichten.",
    ],
  },
  {
    h: "4. Hosting",
    p: [
      "Das Hosting erfolgt ausschließlich in Rechenzentren in Deutschland. Eine Übermittlung in Drittländer findet nicht statt.",
    ],
  },
  {
    h: "5. Speicherdauer",
    p: [
      "Personenbezogene Daten werden gelöscht, sobald der Zweck entfällt und keine gesetzlichen Aufbewahrungsfristen (z. B. nach HGB/AO) entgegenstehen.",
    ],
  },
  {
    h: "6. Ihre Rechte",
    p: [
      "Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie Widerspruch. Zudem besteht ein Beschwerderecht bei einer Aufsichtsbehörde.",
    ],
  },
];

export default function DatenschutzPage() {
  return (
    <PublicPage title="Datenschutzerklärung" subtitle="Transparenz nach DSGVO." narrow>
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
          Hinweis: Diese Datenschutzerklärung ist ein Mustertext und vor Veröffentlichung rechtlich zu prüfen.
        </p>
      </div>
    </PublicPage>
  );
}
