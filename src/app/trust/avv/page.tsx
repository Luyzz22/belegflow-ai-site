import type { Metadata } from "next";
import PublicPage from "@/components/PublicPage";
import PrintButton from "@/components/PrintButton";

export const metadata: Metadata = {
  title: "Auftragsverarbeitungsvereinbarung (AVV) — vollständig",
  description: "Vollständige Auftragsverarbeitungsvereinbarung nach Art. 28 DSGVO für FlowCheck AI+ — druckbar.",
};

const H2 = "mt-7 text-base font-semibold text-[#003856]";
const P = "mt-2";

export default function TrustAvvPage() {
  return (
    <PublicPage title="Auftragsverarbeitungsvereinbarung" narrow>
      <div className="rounded-2xl bg-white p-8 text-sm leading-relaxed text-stone-600 shadow-sm ring-1 ring-stone-200/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-stone-400">Stand: Juni 2026 · nach Art. 28 DSGVO</p>
          <PrintButton />
        </div>

        {/* Parteien */}
        <div className="mt-4 rounded-xl border border-stone-200 bg-[#faf9f7] p-4">
          <p>Diese Auftragsverarbeitungsvereinbarung (nachfolgend „Vereinbarung“) wird geschlossen zwischen</p>
          <p className="mt-3">
            <span className="font-semibold text-[#1a1a2e]">dem Auftraggeber</span>
            <br />
            <span className="text-stone-400">(Name und Anschrift des Kunden — wird bei Vertragsschluss ausgefüllt)</span>
            <br />— nachfolgend „Verantwortlicher“ —
          </p>
          <p className="mt-3">und</p>
          <p className="mt-3">
            <span className="font-semibold text-[#1a1a2e]">SBS Deutschland GmbH &amp; Co. KG</span>
            <br />— nachfolgend „Auftragnehmer“ bzw. „Auftragsverarbeiter“ —
          </p>
        </div>

        <h2 className="mt-6 text-base font-semibold text-[#003856]">§ 1 Gegenstand und Dauer</h2>
        <p className={P}>
          Gegenstand dieser Vereinbarung ist die Verarbeitung personenbezogener Daten durch den Auftragnehmer im
          Rahmen der Bereitstellung der Software FlowCheck AI+. Die Vereinbarung gilt für die Dauer des zugrunde
          liegenden Hauptvertrags und endet mit dessen Beendigung.
        </p>

        <h2 className={H2}>§ 2 Art und Zweck der Verarbeitung</h2>
        <p className={P}>
          Zweck ist die automatisierte Verarbeitung von Eingangsrechnungen: Extraktion, Validierung, Kontierung,
          Freigabe und DATEV-Export sowie die zugehörige revisionssichere Protokollierung. Die Verarbeitung erfolgt
          ausschließlich zur Erfüllung der vertraglich vereinbarten Leistungen.
        </p>

        <h2 className={H2}>§ 3 Art der personenbezogenen Daten</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>Rechnungsdaten (Name, Adresse, IBAN, USt-IdNr.)</li>
          <li>Buchhaltungsdaten (Kontierung, Freigaben, Zahlungsstatus)</li>
          <li>Nutzerdaten (E-Mail-Adresse, Name, Rolle)</li>
          <li>Protokolldaten (Audit-Trail, Zeitstempel)</li>
        </ul>

        <h2 className={H2}>§ 4 Kategorien betroffener Personen</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>Mitarbeitende des Auftraggebers</li>
          <li>Lieferanten und Geschäftspartner des Auftraggebers</li>
        </ul>

        <h2 className={H2}>§ 5 Rechte und Pflichten des Auftraggebers</h2>
        <p className={P}>
          Der Auftraggeber ist Verantwortlicher im Sinne der DSGVO und allein für die Rechtmäßigkeit der
          Verarbeitung verantwortlich. Er erteilt Weisungen grundsätzlich schriftlich oder in dokumentierter
          elektronischer Form und ist berechtigt, die Verarbeitung jederzeit im vereinbarten Rahmen zu kontrollieren.
        </p>

        <h2 className={H2}>§ 6 Pflichten des Auftragnehmers</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>Verarbeitung ausschließlich auf dokumentierte Weisung des Verantwortlichen (Weisungsgebundenheit).</li>
          <li>Verpflichtung der zur Verarbeitung befugten Personen auf Vertraulichkeit (Art. 28 Abs. 3 lit. b DSGVO).</li>
          <li>Unterstützung des Verantwortlichen bei der Erfüllung von Betroffenenrechten (Art. 12–22 DSGVO).</li>
          <li>Unterstützung bei Meldepflichten (Art. 33, 34 DSGVO) und Datenschutz-Folgenabschätzung (Art. 35).</li>
          <li>Umsetzung der technisch-organisatorischen Maßnahmen nach Art. 32 DSGVO.</li>
        </ul>

        <h2 className={H2}>§ 7 Technisch-organisatorische Maßnahmen</h2>
        <p className={P}>
          Der Auftragnehmer trifft die in den{" "}
          <a href="/trust/tom" className="text-[#003856] hover:underline">Technisch-organisatorischen Maßnahmen (TOM)</a>{" "}
          beschriebenen Maßnahmen nach Art. 32 DSGVO. Die TOM sind Bestandteil dieser Vereinbarung.
        </p>

        <h2 className={H2}>§ 8 Unterauftragnehmer (Sub-Processor)</h2>
        <p className={P}>Der Verantwortliche stimmt dem Einsatz folgender Unterauftragnehmer zu:</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>Anthropic — KI-Extraktion (USA, EU-Standardvertragsklauseln, Zero Data Retention)</li>
          <li>Hetzner Online GmbH — Hosting (Deutschland)</li>
          <li>Neon — Datenbank (Frankfurt, Deutschland)</li>
          <li>Vercel Inc. — Frontend-CDN (Global Edge, ohne Datenzugriff, SCC)</li>
          <li>Stripe Payments Europe — Zahlungsabwicklung (EU/USA, SCC)</li>
        </ul>
        <p className={P}>
          Der Auftragnehmer informiert den Verantwortlichen über beabsichtigte Änderungen und räumt ein
          Widerspruchsrecht ein.
        </p>

        <h2 className={H2}>§ 9 Rechte des Auftraggebers (Audit, Kontrolle)</h2>
        <p className={P}>
          Der Verantwortliche ist berechtigt, die Einhaltung dieser Vereinbarung zu überprüfen — durch Auskünfte,
          Vorlage von Nachweisen oder Inspektionen nach vorheriger angemessener Ankündigung.
        </p>

        <h2 className={H2}>§ 10 Löschung nach Auftragsende</h2>
        <p className={P}>
          Nach Beendigung der Verarbeitung werden personenbezogene Daten nach Wahl des Verantwortlichen gelöscht oder
          zurückgegeben, soweit keine gesetzliche Aufbewahrungspflicht (insbesondere GoBD, § 147 AO) entgegensteht.
        </p>

        <h2 className={H2}>§ 11 Haftung</h2>
        <p className={P}>
          Die Haftung richtet sich nach Art. 82 DSGVO sowie den Regelungen des Hauptvertrags. Im Innenverhältnis
          haftet jede Partei für die ihr zuzurechnenden Verstöße.
        </p>

        <h2 className={H2}>§ 12 Schlussbestimmungen</h2>
        <p className={P}>
          Es gilt deutsches Recht. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen
          Bestimmungen unberührt. Änderungen bedürfen der Textform.
        </p>

        {/* Unterschriften */}
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {["Auftraggeber (Verantwortlicher)", "SBS Deutschland GmbH & Co. KG (Auftragnehmer)"].map((rolle) => (
            <div key={rolle}>
              <div className="h-12 border-b border-stone-400" />
              <p className="mt-1 text-xs text-[#64748b]">Ort, Datum</p>
              <div className="mt-8 h-12 border-b border-stone-400" />
              <p className="mt-1 text-xs text-[#64748b]">Unterschrift · {rolle}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicPage>
  );
}
