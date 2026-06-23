import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PublicPage from "@/components/PublicPage";
import { Breadcrumb, H2, P, Disclaimer, JsonLd, articleGraph } from "@/components/wissen/parts";

const TITLE = "Häufige XRechnung-Fehler — EN-16931-Regeln in Klartext (mit Lösung)";
const DESC =
  "Die häufigsten Validierungsfehler bei XRechnung und EN 16931: Regel-Code (BR-…), verständliche Bedeutung, typische Ursache und konkrete Lösung. Direkt prüfbar.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ["XRechnung Fehler", "EN 16931 Fehler", "BR-DE-15", "BR-CO-15", "XRechnung Validierungsfehler", "Leitweg-ID"],
  alternates: { canonical: "/wissen/xrechnung-fehler" },
  openGraph: { title: TITLE, description: DESC, url: "/wissen/xrechnung-fehler", type: "article" },
};

interface Rule {
  code: string;
  field?: string;
  meaning: string;
  cause: string;
  fix: string;
}

const GROUPS: { category: string; rules: Rule[] }[] = [
  {
    category: "Pflichtfelder",
    rules: [
      { code: "BR-02", field: "BT-1", meaning: "Die Rechnung muss eine Rechnungsnummer enthalten.", cause: "Feld leer oder nicht gesetzt.", fix: "Eine eindeutige Rechnungsnummer (BT-1) vergeben." },
      { code: "BR-03", field: "BT-2", meaning: "Die Rechnung muss ein Rechnungsdatum enthalten.", cause: "Ausstellungsdatum fehlt oder hat ein ungültiges Format.", fix: "Rechnungsdatum (BT-2) im korrekten Datumsformat setzen." },
      { code: "BR-16", field: "BG-25", meaning: "Die Rechnung muss mindestens eine Rechnungsposition enthalten.", cause: "Keine Position (BG-25) im Dokument vorhanden.", fix: "Mindestens eine Rechnungsposition mit Menge und Betrag ergänzen." },
    ],
  },
  {
    category: "XRechnung-spezifisch",
    rules: [
      {
        code: "BR-DE-15",
        field: "BT-10",
        meaning: "Die Käuferreferenz (z. B. Leitweg-ID) ist in der XRechnung ein Pflichtfeld.",
        cause: "Häufigster Praxisfehler: Käuferreferenz/Leitweg-ID fehlt — besonders bei Rechnungen an die öffentliche Verwaltung.",
        fix: "Die vom Empfänger genannte Käuferreferenz bzw. Leitweg-ID in BT-10 eintragen.",
      },
    ],
  },
  {
    category: "Rechenregeln",
    rules: [
      { code: "BR-CO-10", meaning: "Die Summe der Positionsnettobeträge muss der Summe der einzelnen Positionen entsprechen.", cause: "Rundungs- oder Summierungsfehler bei den Positionsbeträgen.", fix: "Positionsnettobeträge prüfen und die Summe konsistent berechnen." },
      { code: "BR-CO-13", meaning: "Der Rechnungsbetrag netto = Summe der Positionen − Nachlässe + Zuschläge.", cause: "Nachlässe/Zuschläge auf Dokumentebene nicht korrekt verrechnet.", fix: "Netto-Gesamtbetrag aus Positionen, Nachlässen und Zuschlägen neu ableiten." },
      { code: "BR-CO-15", meaning: "Der Rechnungsbetrag brutto = Netto-Betrag + Umsatzsteuer-Betrag.", cause: "Brutto, Netto und USt sind rechnerisch nicht konsistent.", fix: "Brutto als Summe aus Netto und ausgewiesenem USt-Betrag setzen." },
    ],
  },
  {
    category: "Zahlung",
    rules: [
      { code: "BR-CO-25", meaning: "Bei einem fälligen Betrag größer 0 ist ein Fälligkeitsdatum oder eine Zahlungsbedingung erforderlich.", cause: "Weder Fälligkeitsdatum noch Zahlungsbedingungen angegeben.", fix: "Entweder ein Fälligkeitsdatum oder eine Zahlungsbedingung (z. B. Zahlungsziel) ergänzen." },
    ],
  },
];

export default function XRechnungFehlerPage() {
  const faq = GROUPS.flatMap((g) => g.rules).map((r) => ({ q: `Was bedeutet ${r.code}?`, a: `${r.meaning} ${r.fix}` }));

  return (
    <PublicPage title={TITLE} subtitle="Wenn die Validierung einen Regel-Code meldet, finden Sie hier die verständliche Bedeutung samt Lösung. Alle Codes entsprechen dem EN-16931-/XRechnung-Regelwerk (KoSIT).">
      <JsonLd data={articleGraph({ title: TITLE, description: DESC, slug: "/wissen/xrechnung-fehler", faq })} />
      <Breadcrumb title="XRechnung-Fehler" />

      <P>
        Die folgende Übersicht erklärt häufige Validierungsfehler. Jeder Eintrag nennt den <strong>Regel-Code</strong>,
        das betroffene <strong>Feld (BT/BG)</strong>, die <strong>Bedeutung</strong>, die typische{" "}
        <strong>Ursache</strong> und einen konkreten <strong>Lösungsweg</strong>. Den eigenen Beleg können Sie jederzeit
        kostenlos im{" "}
        <a href="/e-rechnung-pruefen" className="font-medium text-[#003856] hover:underline">E-Rechnungs-Check</a> prüfen.
      </P>

      {GROUPS.map((g) => (
        <section key={g.category}>
          <H2>{g.category}</H2>
          <div className="mt-4 space-y-4">
            {g.rules.map((r) => (
              <div key={r.code} className="rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-5 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-[#003856]/5 px-2 py-0.5 font-mono text-xs font-semibold text-[#003856]">{r.code}</span>
                  {r.field && <span className="rounded bg-[#c8985a]/10 px-2 py-0.5 font-mono text-xs font-semibold text-[#b07f42]">{r.field}</span>}
                </div>
                <p className="mt-2.5 font-medium text-[#1a1a2e]">{r.meaning}</p>
                <dl className="mt-2 space-y-1 text-sm">
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-semibold text-[#64748b]">Ursache:</dt>
                    <dd className="text-[#475569]">{r.cause}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-semibold text-[#64748b]">Lösung:</dt>
                    <dd className="text-[#475569]">{r.fix}</dd>
                  </div>
                </dl>
                <Link href="/e-rechnung-pruefen" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#003856] hover:gap-1.5">
                  Jetzt prüfen <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      ))}

      <p className="mt-8 text-sm text-[#64748b]">
        Diese Liste deckt häufige Fälle ab und wird laufend erweitert. Das vollständige Regelwerk umfasst weitere Regeln
        (BR-…, BR-CO-…, BR-S-…, BR-DE-…) der KoSIT-/EN-16931-Spezifikation.
      </p>

      <Disclaimer />
    </PublicPage>
  );
}
