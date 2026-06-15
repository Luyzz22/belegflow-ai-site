import type { Metadata } from "next";
import PublicPage from "@/components/PublicPage";
import PrintButton from "@/components/PrintButton";

export const metadata: Metadata = {
  title: "Auftragsverarbeitungsvereinbarung (AVV)",
  description: "Auftragsverarbeitungsvereinbarung nach Art. 28 DSGVO für FlowCheck AI+.",
};

const H2 = "mt-8 text-lg font-semibold text-[#003856]";
const P = "mt-2";

export default function AvvPage() {
  return (
    <PublicPage title="Auftragsverarbeitungsvereinbarung (AVV)" narrow>
      <div className="rounded-2xl bg-white p-8 text-sm leading-relaxed text-stone-600 shadow-sm ring-1 ring-stone-200/60">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-stone-400">Stand: Juni 2026 · nach Art. 28 DSGVO</p>
          <PrintButton />
        </div>

        <p className={`${P} mt-4`}>
          Diese Vereinbarung konkretisiert die Verpflichtungen zur Auftragsverarbeitung zwischen dem Verantwortlichen
          (Kunde) und der SBS Deutschland GmbH &amp; Co. KG als Auftragsverarbeiter („FlowCheck AI+“).
        </p>

        <h2 className="mt-6 text-lg font-semibold text-[#003856]">1. Gegenstand und Dauer</h2>
        <p className={P}>
          Gegenstand ist die Verarbeitung personenbezogener Daten im Rahmen der Nutzung von FlowCheck AI+ zur
          Eingangsrechnungsverarbeitung. Die Dauer entspricht der Laufzeit des Hauptvertrags.
        </p>

        <h2 className={H2}>2. Art und Zweck der Verarbeitung</h2>
        <p className={P}>
          Extraktion, Validierung, Kontierung, Freigabe und Export von Rechnungsdaten sowie zugehörige
          Protokollierung. Zweck ist die Automatisierung der Kreditorenbuchhaltung des Kunden.
        </p>

        <h2 className={H2}>3. Kategorien betroffener Personen und Daten</h2>
        <p className={P}>
          Betroffene: Mitarbeitende des Kunden, Ansprechpartner von Lieferanten. Datenkategorien: Stammdaten,
          Rechnungs- und Zahlungsdaten, Kontaktdaten, Nutzungs- und Protokolldaten.
        </p>

        <h2 className={H2}>4. Technisch-organisatorische Maßnahmen (TOM)</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>Verschlüsselung (TLS 1.3 in Transit, AES-256 at Rest)</li>
          <li>Zutritts-, Zugangs- und Zugriffskontrolle (rollenbasiert)</li>
          <li>Revisionssichere Protokollierung (Audit-Trail, GoBD)</li>
          <li>Verfügbarkeit und Belastbarkeit (Backups, Monitoring)</li>
          <li>Trennungs- und Weisungskontrolle</li>
        </ul>

        <h2 className={H2}>5. Sub-Processor</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>Anthropic — KI-Extraktion (USA, SCC)</li>
          <li>Hetzner Online GmbH — Hosting (Deutschland)</li>
          <li>Vercel Inc. — CDN (USA, SCC)</li>
          <li>Stripe Payments Europe — Zahlungen (EU/USA, SCC)</li>
        </ul>

        <h2 className={H2}>6. Weisungsbefugnis</h2>
        <p className={P}>
          Der Auftragsverarbeiter verarbeitet Daten ausschließlich auf dokumentierte Weisung des Verantwortlichen,
          es sei denn, eine gesetzliche Verpflichtung besteht.
        </p>

        <h2 className={H2}>7. Löschung nach Auftragsende</h2>
        <p className={P}>
          Nach Beendigung werden personenbezogene Daten gelöscht oder zurückgegeben, soweit keine gesetzliche
          Aufbewahrungspflicht (GoBD, § 147 AO) entgegensteht.
        </p>

        <h2 className={H2}>8. Audit-Recht</h2>
        <p className={P}>
          Der Verantwortliche ist berechtigt, die Einhaltung dieser Vereinbarung zu überprüfen — durch Auskünfte,
          Nachweise oder Inspektionen nach vorheriger Ankündigung.
        </p>

        <p className="mt-8 text-xs text-stone-400">
          Die rechtsverbindliche AVV wird auf Anfrage unter ki@sbsdeutschland.de bereitgestellt und gegengezeichnet.
        </p>
      </div>
    </PublicPage>
  );
}
