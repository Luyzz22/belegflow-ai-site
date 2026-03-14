import Link from "next/link";

export default function AGBPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d4d4d4]">
      <nav className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-[72px] flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e85d04] rounded-lg flex items-center justify-center font-bold text-white text-xs">BF</div>
            <span className="text-lg font-bold text-white" style={{fontFamily:"'Instrument Serif',serif"}}>BelegFlow AI</span>
          </Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-white mb-8" style={{fontFamily:"'Instrument Serif',serif"}}>Allgemeine Geschäftsbedingungen</h1>
        <div className="space-y-8 text-sm leading-relaxed">
          <div>
            <h2 className="text-white font-semibold mb-2">§ 1 Geltungsbereich</h2>
            <p>Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der SaaS-Plattform BelegFlow AI, betrieben von SBS Deutschland GmbH & Co. KG, Heiligkreuzsteinach. BelegFlow AI bietet eine KI-gestützte Rechnungsverarbeitungs- und E-Rechnungs-Compliance-Lösung für Unternehmen an.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-2">§ 2 Vertragsgegenstand</h2>
            <p>BelegFlow AI stellt eine cloudbasierte Plattform zur automatisierten Verarbeitung von Eingangsrechnungen bereit. Der Leistungsumfang richtet sich nach dem gewählten Tarif (Starter, Professional oder Enterprise). Die Plattform umfasst KI-gestützte Rechnungserkennung, automatische Kontierung, DATEV-Export, Freigabe-Workflows und GoBD-konforme Archivierung.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-2">§ 3 Registrierung und Konto</h2>
            <p>Die Nutzung von BelegFlow AI erfordert eine Registrierung mit gültiger E-Mail-Adresse. Der Nutzer ist für die Geheimhaltung seiner Zugangsdaten verantwortlich. Bei Verdacht auf unbefugte Nutzung ist der Nutzer verpflichtet, uns unverzüglich zu informieren. Jeder Registrierung wird automatisch ein Tenant zugewiesen, der die Datenisolation zwischen verschiedenen Unternehmen gewährleistet.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-2">§ 4 Preise und Zahlung</h2>
            <p>Die aktuellen Preise sind auf der Website unter belegflow-ai.de einsehbar. Der Starter-Tarif ist kostenlos und umfasst 50 Rechnungen pro Monat. Kostenpflichtige Tarife werden monatlich abgerechnet. Die Zahlung erfolgt per Kreditkarte oder SEPA-Lastschrift über unseren Zahlungsdienstleister Stripe. Alle Preise verstehen sich zuzüglich der gesetzlichen Mehrwertsteuer.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-2">§ 5 Verfügbarkeit und SLA</h2>
            <p>Wir bemühen uns um eine Verfügbarkeit von 99,5% pro Monat. Geplante Wartungsarbeiten werden mindestens 48 Stunden im Voraus angekündigt. Im Enterprise-Tarif gelten individuelle SLA-Vereinbarungen. Ausfälle aufgrund höherer Gewalt oder Störungen bei Drittanbietern sind von der Verfügbarkeitsgarantie ausgenommen.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-2">§ 6 Datenschutz und Datensicherheit</h2>
            <p>Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer Datenschutzerklärung und den Bestimmungen der DSGVO. Rechnungsdaten werden auf Servern in Deutschland (Rechenzentrum Frankfurt am Main) gespeichert. Eine Auftragsverarbeitungsvereinbarung (AVV) kann auf Anfrage bereitgestellt werden.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-2">§ 7 Nutzungsrechte und geistiges Eigentum</h2>
            <p>BelegFlow AI räumt dem Nutzer ein nicht-exklusives, nicht übertragbares Recht zur Nutzung der Plattform für die Dauer des Vertragsverhältnisses ein. Der Nutzer behält alle Rechte an seinen hochgeladenen Daten. Die KI-generierten Kontierungsvorschläge dienen als Unterstützung und ersetzen keine steuerliche Beratung.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-2">§ 8 Haftung</h2>
            <p>Die Haftung von BelegFlow AI ist auf Vorsatz und grobe Fahrlässigkeit beschränkt. Für die Richtigkeit der KI-generierten Kontierungsvorschläge übernehmen wir keine Gewähr. Der Nutzer ist verpflichtet, alle KI-Vorschläge vor der Übernahme in die Buchhaltung zu prüfen. Die Haftung ist in jedem Fall auf den in den letzten 12 Monaten gezahlten Betrag beschränkt.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-2">§ 9 Kündigung</h2>
            <p>Der Starter-Tarif kann jederzeit ohne Frist gekündigt werden. Kostenpflichtige Tarife können zum Ende des jeweiligen Abrechnungszeitraums gekündigt werden. Bei Kündigung werden die Daten nach 30 Tagen gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Der Nutzer kann seine Daten vor der Löschung exportieren.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-2">§ 10 Schlussbestimmungen</h2>
            <p>Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Gerichtsstand ist, soweit gesetzlich zulässig, Heidelberg. Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>
          </div>
          <div>
            <p className="text-[#525252]">Stand: 14. März 2026</p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/[0.06]">
          <Link href="/" className="text-sm text-[#e85d04] hover:text-[#f48c06]">← Zurück zur Startseite</Link>
        </div>
      </div>
    </div>
  );
}
