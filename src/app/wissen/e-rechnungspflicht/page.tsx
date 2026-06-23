import type { Metadata } from "next";
import PublicPage from "@/components/PublicPage";
import { Breadcrumb, H2, H3, P, UL, LI, Callout, ToolCta, Disclaimer, JsonLd, articleGraph } from "@/components/wissen/parts";

const TITLE = "E-Rechnungspflicht 2025, 2027 & 2028 — Fristen, Betroffene, Ausnahmen";
const DESC =
  "Die E-Rechnungspflicht im inländischen B2B: Empfangspflicht seit 1.1.2025, Ausstellungspflicht ab 2027 (> 800.000 € Umsatz) bzw. 2028 für alle. Ausnahmen, Formate und Aufbewahrung.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ["E-Rechnungspflicht", "E-Rechnung 2025", "E-Rechnung 2027", "E-Rechnung 2028", "XRechnung Pflicht", "Wachstumschancengesetz"],
  alternates: { canonical: "/wissen/e-rechnungspflicht" },
  openGraph: { title: TITLE, description: DESC, url: "/wissen/e-rechnungspflicht", type: "article" },
};

const FAQ = [
  {
    q: "Ab wann gilt die E-Rechnungspflicht?",
    a: "Die Empfangspflicht gilt für alle inländischen Unternehmen bereits seit dem 1.1.2025. Die Pflicht zum Ausstellen greift gestaffelt: ab 1.1.2027 für Unternehmen mit mehr als 800.000 € Vorjahresumsatz (2026), ab 1.1.2028 für alle inländischen B2B-Unternehmen.",
  },
  {
    q: "Ist ein PDF eine E-Rechnung?",
    a: "Nein. Ein reines PDF ist keine E-Rechnung, sondern eine „sonstige Rechnung“. Eine E-Rechnung ist ein strukturierter, maschinenlesbarer Datensatz nach EN 16931 (z. B. XRechnung oder ZUGFeRD ab 2.x / Factur-X). ZUGFeRD ist ein Hybrid aus PDF/A-3 mit eingebettetem konformem XML und zählt als E-Rechnung.",
  },
  {
    q: "Muss ich schon heute etwas tun?",
    a: "Ja. Seit dem 1.1.2025 muss jedes inländische Unternehmen E-Rechnungen empfangen und maschinell verarbeiten können — dafür gibt es keine Übergangsfrist. Ein E-Mail-Postfach genügt zum Empfang; eingehende XRechnungen/ZUGFeRD sollten geprüft und verarbeitet werden.",
  },
  {
    q: "Wie lange muss ich E-Rechnungen aufbewahren?",
    a: "E-Rechnungen sind 8 Jahre elektronisch und im strukturierten Originalformat aufzubewahren (GoBD). Ein Papierausdruck genügt nicht.",
  },
];

export default function ERechnungspflichtPage() {
  return (
    <PublicPage title={TITLE} subtitle="Was das Wachstumschancengesetz für die elektronische Rechnung im inländischen B2B bedeutet — nach aktueller Rechtslage zusammengefasst.">
      <JsonLd data={articleGraph({ title: TITLE, description: DESC, slug: "/wissen/e-rechnungspflicht", faq: FAQ })} />
      <Breadcrumb title="E-Rechnungspflicht" />

      <H2>Rechtsgrundlage</H2>
      <P>
        Die E-Rechnungspflicht wurde mit dem <strong>Wachstumschancengesetz</strong> (27.03.2024) eingeführt und ist in{" "}
        <strong>§ 14 und § 27 Abs. 38 UStG</strong> verankert. Die maßgeblichen Detailregelungen erläutert das
        Bundesministerium der Finanzen in seinen FAQ auf{" "}
        <a href="https://www.bundesfinanzministerium.de" target="_blank" rel="noopener noreferrer" className="font-medium text-[#003856] hover:underline">
          bundesfinanzministerium.de
        </a>
        .
      </P>

      <H2>Was ist überhaupt eine E-Rechnung?</H2>
      <P>
        Eine E-Rechnung ist ein <strong>strukturierter, maschinenlesbarer Datensatz nach EN 16931</strong> — etwa{" "}
        <strong>XRechnung</strong> oder <strong>ZUGFeRD ab 2.x / Factur-X</strong>. Ein <strong>reines PDF ist keine
        E-Rechnung</strong>, sondern gilt als „sonstige Rechnung“. ZUGFeRD ist ein Hybridformat: eine PDF/A-3-Datei mit
        eingebettetem, konformem XML — und zählt damit als E-Rechnung.
      </P>

      <H2>Die Fristen im inländischen B2B</H2>

      <H3>Seit 1.1.2025 — Empfangspflicht für alle</H3>
      <P>
        Jedes inländische Unternehmen muss E-Rechnungen <strong>empfangen und maschinell verarbeiten</strong> können.
        Für den Empfang gibt es <strong>keine Übergangsfrist</strong>. Zum reinen Empfang genügt bereits ein E-Mail-Postfach.
      </P>

      <H3>Phase 1 (1.1.2025 – 31.12.2026)</H3>
      <P>
        Der Vorrang der Papierrechnung entfällt; jedes Unternehmen <strong>darf</strong> E-Rechnungen versenden. Papier
        bleibt weiterhin erlaubt; <strong>PDF und sonstige elektronische Formate nur mit Zustimmung des Empfängers</strong>.
      </P>

      <H3>Phase 2 (1.1.2027 – 31.12.2027)</H3>
      <P>
        Unternehmen mit einem <strong>Vorjahresumsatz (2026) über 800.000 €</strong> müssen E-Rechnungen{" "}
        <strong>ausstellen</strong>. Unternehmen mit <strong>≤ 800.000 €</strong> dürfen noch bis zum 31.12.2027
        Papier bzw. PDF (mit Zustimmung) oder EDI nutzen.
      </P>

      <H3>Phase 3 (ab 1.1.2028)</H3>
      <P>
        <strong>Alle</strong> inländischen B2B-Unternehmen müssen E-Rechnungen ausstellen. EDI ist nur noch zulässig,
        wenn sich daraus ein EN-16931-konformer Meldedatensatz extrahieren lässt.
      </P>

      <Callout>
        <strong>Praxis-Hinweis:</strong> Empfangen müssen alle schon <strong>seit 2025</strong>. Eingehende
        XRechnungen und ZUGFeRD-Dateien zu prüfen und korrekt zu verarbeiten, ist damit bereits heute Pflichtthema —
        genau hier setzt unser kostenloser{" "}
        <a href="/e-rechnung-pruefen" className="font-medium text-[#003856] hover:underline">E-Rechnungs-Check</a> an.
      </Callout>

      <H2>Wer ist betroffen?</H2>
      <P>
        Die Ausstellungspflicht betrifft Umsätze, bei denen <strong>Leistender und Empfänger im Inland ansässig</strong>{" "}
        sind und ein <strong>steuerbarer, steuerpflichtiger B2B-Umsatz</strong> vorliegt.
      </P>

      <H2>Ausnahmen von der Ausstellungspflicht</H2>
      <UL>
        <LI>Kleinbetragsrechnungen bis 250 € brutto (§ 33 UStDV)</LI>
        <LI>Fahrausweise (§ 34 UStDV)</LI>
        <LI>Leistungen an Endverbraucher (B2C)</LI>
        <LI>Kleinunternehmer nach § 19 UStG (§ 34a UStDV)</LI>
        <LI>nach § 4 Nr. 8–29 UStG steuerfreie Umsätze</LI>
      </UL>

      <H2>Aufbewahrung</H2>
      <P>
        E-Rechnungen sind <strong>8 Jahre elektronisch</strong> im strukturierten Originalformat aufzubewahren (GoBD).
        Ein <strong>Papierausdruck genügt nicht</strong>.
      </P>

      <ToolCta />
      <Disclaimer />
    </PublicPage>
  );
}
