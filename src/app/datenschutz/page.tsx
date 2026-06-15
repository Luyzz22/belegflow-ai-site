import type { Metadata } from "next";
import PublicPage from "@/components/PublicPage";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Datenschutzerklärung von FlowCheck AI+ nach DSGVO — Verantwortlicher, Verarbeitungszwecke, Sub-Processor und Betroffenenrechte.",
};

const H2 = "mt-8 text-lg font-semibold text-[#003856]";
const P = "mt-2";

export default function DatenschutzPage() {
  return (
    <PublicPage title="Datenschutzerklärung" narrow>
      <div className="rounded-2xl bg-white p-8 text-sm leading-relaxed text-stone-600 shadow-sm ring-1 ring-stone-200/60">
        <p className="text-xs text-stone-400">Stand: Juni 2026</p>

        <h2 className="mt-4 text-lg font-semibold text-[#003856]">1. Verantwortlicher</h2>
        <p className={P}>
          SBS Deutschland GmbH &amp; Co. KG, In der Dell 19, 69469 Weinheim, Deutschland.
          <br />
          E-Mail:{" "}
          <a href="mailto:ki@sbsdeutschland.de" className="text-[#003856] hover:underline">
            ki@sbsdeutschland.de
          </a>
        </p>

        <h2 className={H2}>2. Datenschutzbeauftragter</h2>
        <p className={P}>
          Ein Datenschutzbeauftragter ist gemäß Art. 37 DSGVO i. V. m. § 38 BDSG nicht bestellt, da die
          gesetzlichen Schwellenwerte (u. a. weniger als 20 ständig mit der automatisierten Verarbeitung
          beschäftigte Personen) nicht erreicht werden. Anfragen richten Sie an die o. g. Adresse.
        </p>

        <h2 className={H2}>3. Zwecke und Rechtsgrundlagen der Verarbeitung</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li><strong>Rechnungsdaten / Buchhaltung</strong> — Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).</li>
          <li><strong>KI-gestützte Extraktion</strong> — Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Automatisierung).</li>
          <li><strong>Nutzer-/Account-Daten</strong> — Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).</li>
          <li><strong>Audit-Trail / Protokollierung</strong> — Art. 6 Abs. 1 lit. c DSGVO (gesetzliche Pflicht, GoBD).</li>
          <li><strong>Zahlungsdaten</strong> — Art. 6 Abs. 1 lit. b DSGVO (Vertrag/Abrechnung).</li>
        </ul>

        <h2 className={H2}>4. Empfänger / Auftragsverarbeiter (Sub-Processor)</h2>
        <p className={P}>Mit folgenden Dienstleistern bestehen Verträge zur Auftragsverarbeitung (Art. 28 DSGVO):</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li><strong>Anthropic</strong> — KI-Extraktion (USA, EU-Standardvertragsklauseln).</li>
          <li><strong>Hetzner Online GmbH</strong> — Hosting (Deutschland, ISO 27001).</li>
          <li><strong>Vercel Inc.</strong> — Frontend-Auslieferung/CDN (USA, EU-Standardvertragsklauseln).</li>
          <li><strong>Stripe Payments Europe</strong> — Zahlungsabwicklung (EU/USA, EU-Standardvertragsklauseln).</li>
        </ul>

        <h2 className={H2}>5. Speicherdauer und Löschfristen</h2>
        <p className={P}>
          Rechnungs- und buchhaltungsrelevante Daten sowie der Audit-Trail werden gemäß GoBD und § 147 AO für
          10 Jahre aufbewahrt. KI-Analyse-Logs werden nach maximal 1 Jahr gelöscht. Account-bezogene Daten werden
          mit Löschung des Kontos entfernt; gesetzlich aufbewahrungspflichtige Daten werden anonymisiert.
        </p>

        <h2 className={H2}>6. Technische und organisatorische Maßnahmen</h2>
        <p className={P}>
          Verschlüsselung in der Übertragung (TLS 1.3) und im Ruhezustand (AES-256), rollenbasierte Zugriffskontrolle,
          revisionssichere Protokollierung, Hosting ausschließlich in deutschen Rechenzentren.
        </p>

        <h2 className={H2}>7. Hinweis zur KI-Verarbeitung (Art. 50 EU AI Act)</h2>
        <p className={P}>
          FlowCheck AI+ kennzeichnet KI-generierte Inhalte als solche. Es werden keine automatisierten Entscheidungen
          mit rechtlicher Wirkung über natürliche Personen getroffen; jede Freigabe erfolgt durch einen Menschen
          (Human-in-the-Loop).
        </p>

        <h2 className={H2}>8. Ihre Rechte</h2>
        <p className={P}>
          Sie haben das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung
          (Art. 18), Datenübertragbarkeit (Art. 20) sowie Widerspruch (Art. 21). Zudem besteht ein Beschwerderecht
          bei einer Aufsichtsbehörde, z. B. dem Landesbeauftragten für Datenschutz Baden-Württemberg.
        </p>

        <h2 className={H2}>9. Kontakt</h2>
        <p className={P}>
          Für Anfragen zum Datenschutz:{" "}
          <a href="mailto:ki@sbsdeutschland.de" className="text-[#003856] hover:underline">
            ki@sbsdeutschland.de
          </a>
        </p>
      </div>
    </PublicPage>
  );
}
