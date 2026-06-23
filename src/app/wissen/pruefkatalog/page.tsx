import type { Metadata } from "next";
import { FileCode2, Boxes, Scale } from "lucide-react";
import PublicPage from "@/components/PublicPage";
import { Breadcrumb, H2, P, Callout, ToolCta, Disclaimer, JsonLd, articleGraph } from "@/components/wissen/parts";

const TITLE = "Prüfkatalog — Was bei der E-Rechnung geprüft wird (3 Ebenen)";
const DESC =
  "Wie eine E-Rechnung validiert wird: XML-Syntax, Schema (UBL/CII) und Geschäftsregeln (Schematron, EN 16931 + XRechnung-CIUS). Was „valide“ und „Warnung“ bedeuten — und warum eine fachliche Prüfung trotzdem nötig bleibt.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ["E-Rechnung Prüfung", "EN 16931 Validierung", "Schematron", "UBL CII", "XRechnung CIUS", "KoSIT"],
  alternates: { canonical: "/wissen/pruefkatalog" },
  openGraph: { title: TITLE, description: DESC, url: "/wissen/pruefkatalog", type: "article" },
};

const FAQ = [
  {
    q: "Welche Ebenen werden bei der E-Rechnung geprüft?",
    a: "Drei Ebenen: 1) XML-Syntax (ist die Datei wohlgeformt?), 2) Schema (entspricht die Struktur dem UBL- oder CII-Format?), 3) Geschäftsregeln per Schematron nach EN 16931 und XRechnung-CIUS (Pflichtfelder, Rechenregeln, USt-Logik).",
  },
  {
    q: "Was bedeutet „valide“ gegenüber einer „Warnung“?",
    a: "„Valide“ heißt, dass keine Fehler gegen die verpflichtenden Regeln vorliegen. Eine Warnung weist auf empfohlene, aber nicht zwingende Punkte hin — die Rechnung kann trotzdem gültig sein.",
  },
  {
    q: "Ist eine technisch valide Rechnung immer korrekt?",
    a: "Nein. Eine Rechnung kann technisch valide sein und inhaltlich dennoch falsch (z. B. falscher Empfänger, falsche Leistung). Die fachliche Prüfung durch einen Menschen bleibt erforderlich.",
  },
];

const LEVELS = [
  {
    icon: FileCode2,
    n: "1",
    title: "XML-Syntax",
    text: "Zuerst wird geprüft, ob die Datei technisch wohlgeformtes XML ist — also ob Tags korrekt geöffnet und geschlossen sind und die Struktur überhaupt maschinell lesbar ist. Schlägt diese Ebene fehl, kann nichts Weiteres geprüft werden.",
  },
  {
    icon: Boxes,
    n: "2",
    title: "Schema (UBL / CII)",
    text: "Anschließend wird die Struktur gegen das jeweilige Format-Schema geprüft: UBL oder CII. Hier zeigt sich, ob die erwarteten Elemente an der richtigen Stelle stehen und die Datentypen passen — die formale Grammatik des Formats.",
  },
  {
    icon: Scale,
    n: "3",
    title: "Geschäftsregeln (Schematron, EN 16931 + XRechnung-CIUS)",
    text: "Auf der dritten Ebene greifen die inhaltlichen Geschäftsregeln per Schematron: Pflichtfelder, Rechenregeln und USt-Logik nach EN 16931 sowie die deutschen XRechnung-Anpassungen (CIUS). Genau diese Ebene liefert die bekannten Regel-Codes wie BR-DE-15 oder BR-CO-15.",
  },
];

export default function PruefkatalogPage() {
  return (
    <PublicPage title={TITLE} subtitle="Eine E-Rechnung wird in drei aufeinander aufbauenden Ebenen validiert. Unser Prüf-Tool gibt genau diese drei Ebenen als Status zurück.">
      <JsonLd data={articleGraph({ title: TITLE, description: DESC, slug: "/wissen/pruefkatalog", faq: FAQ })} />
      <Breadcrumb title="Prüfkatalog" />

      <P>
        Validierung bedeutet nicht „ein Häkchen“, sondern eine Kette aus drei Prüfungen. Fällt eine frühe Ebene aus,
        bauen die nächsten darauf nicht mehr auf. Unser{" "}
        <a href="/e-rechnung-pruefen" className="font-medium text-[#003856] hover:underline">E-Rechnungs-Check</a>{" "}
        zeigt alle drei Ebenen einzeln als grün/gelb/rot an.
      </P>

      <div className="mt-8 space-y-4">
        {LEVELS.map((l) => {
          const Icon = l.icon;
          return (
            <div key={l.n} className="flex gap-4 rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#003856]/5 text-[#003856]">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#1a1a2e]">
                  <span className="text-[#c8985a]">Ebene {l.n}:</span> {l.title}
                </h2>
                <p className="mt-1.5 leading-relaxed text-[#475569]">{l.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      <H2>„Valide“ vs. „Warnung“</H2>
      <P>
        <strong>Valide</strong> bedeutet, dass keine Fehler gegen verpflichtende Regeln vorliegen. Eine{" "}
        <strong>Warnung</strong> markiert empfohlene, aber nicht zwingende Punkte — die Rechnung kann trotz Warnung
        gültig sein. Fehler hingegen müssen behoben werden.
      </P>

      <Callout>
        <strong>Wichtig:</strong> Eine technisch valide Rechnung kann inhaltlich trotzdem falsch sein — etwa mit
        falschem Empfänger, falscher Leistung oder falschem Betrag. Die <strong>fachliche Prüfung durch einen
        Menschen</strong> bleibt unverzichtbar. Die automatische Validierung ist eine Entscheidungshilfe, kein Ersatz
        für die Freigabe.
      </Callout>

      <ToolCta />
      <Disclaimer />
    </PublicPage>
  );
}
