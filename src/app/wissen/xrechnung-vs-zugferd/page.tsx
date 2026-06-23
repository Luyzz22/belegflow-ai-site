import type { Metadata } from "next";
import PublicPage from "@/components/PublicPage";
import { Breadcrumb, H2, P, Callout, ToolCta, Disclaimer, JsonLd, articleGraph } from "@/components/wissen/parts";

const TITLE = "XRechnung vs. ZUGFeRD — der Formatvergleich für die Praxis";
const DESC =
  "XRechnung oder ZUGFeRD/Factur-X? Reines XML gegenüber Hybrid-PDF: Gemeinsamkeiten (EN 16931), Unterschiede und was das für Empfang und Verarbeitung bedeutet.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ["XRechnung vs ZUGFeRD", "ZUGFeRD", "Factur-X", "XRechnung", "EN 16931", "E-Rechnung Formate"],
  alternates: { canonical: "/wissen/xrechnung-vs-zugferd" },
  openGraph: { title: TITLE, description: DESC, url: "/wissen/xrechnung-vs-zugferd", type: "article" },
};

const FAQ = [
  {
    q: "Was ist der Unterschied zwischen XRechnung und ZUGFeRD?",
    a: "XRechnung ist ein reines, strukturiertes XML-Format. ZUGFeRD (ab 2.x, identisch zu Factur-X) ist ein Hybridformat: eine PDF/A-3-Datei mit eingebettetem, EN-16931-konformem XML. Beide erfüllen die EN 16931 und gelten als E-Rechnung.",
  },
  {
    q: "Ist ZUGFeRD eine echte E-Rechnung?",
    a: "Ja, sofern das eingebettete XML EN-16931-konform ist. Ein reines PDF ohne strukturiertes XML ist dagegen keine E-Rechnung.",
  },
];

const ROWS: [string, string, string][] = [
  ["Aufbau", "Reines XML (strukturiert)", "Hybrid: PDF/A-3 mit eingebettetem XML"],
  ["Lesbar für Menschen", "Nur über Viewer/Transformation", "Ja — die PDF-Ebene ist direkt lesbar"],
  ["Syntax", "UBL oder CII", "CII (im eingebetteten XML)"],
  ["Norm", "EN 16931", "EN 16931"],
  ["Gilt als E-Rechnung", "Ja", "Ja (bei konformem XML)"],
];

export default function XRechnungVsZugferdPage() {
  return (
    <PublicPage title={TITLE} subtitle="Beide Formate erfüllen die EN 16931 — sie unterscheiden sich aber im Aufbau. Ein kurzer Überblick für die tägliche Praxis.">
      <JsonLd data={articleGraph({ title: TITLE, description: DESC, slug: "/wissen/xrechnung-vs-zugferd", faq: FAQ })} />
      <Breadcrumb title="XRechnung vs. ZUGFeRD" />

      <P>
        <strong>XRechnung</strong> ist ein <strong>reines XML-Format</strong> — maschinenlesbar, aber ohne eingebaute
        Sichtansicht. <strong>ZUGFeRD</strong> (ab 2.x, technisch identisch zu <strong>Factur-X</strong>) ist ein{" "}
        <strong>Hybridformat</strong>: eine PDF/A-3-Datei, in die ein EN-16931-konformes XML eingebettet ist. Dadurch ist
        die Rechnung sowohl für Menschen (PDF) als auch für Maschinen (XML) nutzbar.
      </P>

      <H2>Vergleich auf einen Blick</H2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(0,56,86,0.06)] text-left text-xs font-medium uppercase tracking-wider text-[#64748b]">
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3">XRechnung</th>
              <th className="px-4 py-3">ZUGFeRD / Factur-X</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(0,56,86,0.06)]">
            {ROWS.map(([label, x, z]) => (
              <tr key={label}>
                <td className="px-4 py-3 font-medium text-[#1a1a2e]">{label}</td>
                <td className="px-4 py-3 text-[#475569]">{x}</td>
                <td className="px-4 py-3 text-[#475569]">{z}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout>
        <strong>Merksatz:</strong> Ein reines PDF ist <strong>keine</strong> E-Rechnung. Erst das strukturierte,
        EN-16931-konforme XML — eigenständig (XRechnung) oder eingebettet (ZUGFeRD) — macht eine Rechnung zur
        E-Rechnung.
      </Callout>

      <P>
        Beide Formate können Sie im{" "}
        <a href="/e-rechnung-pruefen" className="font-medium text-[#003856] hover:underline">E-Rechnungs-Check</a>{" "}
        hochladen — bei ZUGFeRD/Factur-X wird das eingebettete XML automatisch extrahiert und gegen EN 16931 geprüft.
      </P>

      <ToolCta />
      <Disclaimer />
    </PublicPage>
  );
}
