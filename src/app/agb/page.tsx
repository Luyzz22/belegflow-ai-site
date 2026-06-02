import type { Metadata } from "next";
import PublicPage from "@/components/PublicPage";

export const metadata: Metadata = {
  title: "AGB",
  description: "Allgemeine Geschäftsbedingungen für die Nutzung von FlowCheck AI+.",
};

const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: "§ 1 Geltungsbereich",
    p: [
      "Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge über die Nutzung der Software-as-a-Service-Lösung FlowCheck AI+ zwischen der SBS Deutschland GmbH & Co. KG und dem Kunden.",
    ],
  },
  {
    h: "§ 2 Leistungsgegenstand",
    p: [
      "FlowCheck AI+ stellt Funktionen zur automatisierten Verarbeitung, Prüfung, Freigabe und zum Export von Eingangsrechnungen bereit. Der konkrete Funktionsumfang richtet sich nach dem gewählten Tarif.",
    ],
  },
  {
    h: "§ 3 Vertragsschluss und Testphase",
    p: [
      "Der Vertrag kommt mit Registrierung und Bestätigung zustande. Neue Kunden können den Dienst 30 Tage kostenlos testen.",
    ],
  },
  {
    h: "§ 4 Preise und Zahlung",
    p: [
      "Es gelten die zum Zeitpunkt der Bestellung gültigen Preise. Die Abrechnung erfolgt monatlich im Voraus, sofern nicht anders vereinbart.",
    ],
  },
  {
    h: "§ 5 Pflichten des Kunden",
    p: [
      "Der Kunde ist für die Richtigkeit der von ihm bereitgestellten Daten sowie für die Geheimhaltung seiner Zugangsdaten verantwortlich.",
    ],
  },
  {
    h: "§ 6 Verfügbarkeit",
    p: [
      "Wir bemühen uns um eine hohe Verfügbarkeit des Dienstes. Wartungsfenster werden, soweit möglich, rechtzeitig angekündigt.",
    ],
  },
  {
    h: "§ 7 Laufzeit und Kündigung",
    p: [
      "Sofern nicht anders vereinbart, ist der Vertrag monatlich kündbar. Kündigungen bedürfen der Textform.",
    ],
  },
  {
    h: "§ 8 Haftung",
    p: [
      "Die Haftung richtet sich nach den gesetzlichen Vorschriften. Für leichte Fahrlässigkeit haften wir nur bei Verletzung wesentlicher Vertragspflichten.",
    ],
  },
];

export default function AgbPage() {
  return (
    <PublicPage title="Allgemeine Geschäftsbedingungen" narrow>
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
          Hinweis: Diese AGB sind ein Mustertext und vor Veröffentlichung rechtlich zu prüfen.
        </p>
      </div>
    </PublicPage>
  );
}
