// Produkt-Changelog (hardcoded). Neuester Eintrag zuerst.

export interface ChangelogEntry {
  date: string; // "DD.MM.YYYY"
  title: string;
  description: string;
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "15.06.2026",
    title: "Trust Center + AVV + TOM",
    description: "Öffentliches Trust Center mit Datenfluss-Diagramm sowie druckbare AVV- und TOM-Dokumente.",
  },
  {
    date: "14.06.2026",
    title: "Compliance Center + EU-AI-Act-Governance",
    description: "DSGVO-Score, Verarbeitungsregister, KI-Governance und NIS2-Incident-Response.",
  },
  {
    date: "13.06.2026",
    title: "Smart Review Mode + Confidence Scoring",
    description: "Rechnungen im Schnelldurchlauf prüfen — mit Tastenkürzeln und KI-Konfidenz-Score.",
  },
  {
    date: "12.06.2026",
    title: "Finance Copilot + Dark Mode",
    description: "Fragen zu Ihren Finanzdaten direkt im Chat — und ein augenschonender Dark Mode.",
  },
  {
    date: "11.06.2026",
    title: "KI-Extraktion + XRechnung-Parser",
    description: "Automatische Feld-Extraktion aus PDF/Scan sowie deterministisches Parsen von XRechnung/ZUGFeRD.",
  },
  {
    date: "10.06.2026",
    title: "FlowCheck AI+ Launch 🎉",
    description: "Der Start: KI-native Eingangsrechnungsverarbeitung für den Mittelstand.",
  },
];

export const LATEST_CHANGELOG_DATE = CHANGELOG[0].date;
