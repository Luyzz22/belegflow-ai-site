import Link from "next/link";

export default function DatenschutzPage() {
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
        <h1 className="text-3xl font-bold text-white mb-8" style={{fontFamily:"'Instrument Serif',serif"}}>Datenschutzerklärung</h1>
        <div className="space-y-8 text-sm leading-relaxed">
          <div>
            <h2 className="text-white font-semibold mb-2">1. Verantwortlicher</h2>
            <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br/>SBS Deutschland GmbH & Co. KG<br/>Heiligkreuzsteinach, Baden-Württemberg<br/>E-Mail: <a href="mailto:ki@sbsdeutschland.de" className="text-[#e85d04]">ki@sbsdeutschland.de</a></p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-2">2. Erhebung und Speicherung personenbezogener Daten</h2>
            <p>Bei der Nutzung von BelegFlow AI erheben wir folgende Daten: Name, E-Mail-Adresse und Firmenzugehörigkeit bei der Registrierung. Rechnungsdaten, die Sie zur Verarbeitung hochladen. Nutzungsdaten zur Verbesserung unseres Services. Alle Daten werden auf Servern in Deutschland (Frankfurt am Main) verarbeitet und gespeichert.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-2">3. Zweck der Datenverarbeitung</h2>
            <p>Wir verarbeiten Ihre Daten zur Bereitstellung unserer KI-gestützten Rechnungsverarbeitungsdienste, zur Kontoverwaltung und Authentifizierung, zur Abrechnung und Rechnungsstellung, zur Verbesserung unserer Dienste und zur Kommunikation mit Ihnen bezüglich Ihres Kontos.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-2">4. KI-Verarbeitung</h2>
            <p>BelegFlow AI nutzt KI-Modelle (Google Gemini und Anthropic Claude) zur Rechnungserkennung und -kontierung. Ihre Rechnungsdaten werden zu diesem Zweck an die jeweiligen KI-Anbieter übermittelt. Die Verarbeitung erfolgt gemäß den Datenschutzrichtlinien dieser Anbieter und unter Einhaltung der DSGVO.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-2">5. GoBD-Konformität</h2>
            <p>BelegFlow AI erfüllt die Anforderungen der GoBD (Grundsätze zur ordnungsmäßigen Führung und Aufbewahrung von Büchern, Aufzeichnungen und Unterlagen in elektronischer Form). Alle Rechnungsdaten werden revisionssicher mit SHA-256 Hash-Chain archiviert.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-2">6. Ihre Rechte</h2>
            <p>Sie haben das Recht auf Auskunft über Ihre gespeicherten Daten, auf Berichtigung unrichtiger Daten, auf Löschung Ihrer Daten, auf Einschränkung der Verarbeitung, auf Datenübertragbarkeit und auf Widerspruch gegen die Verarbeitung. Kontaktieren Sie uns unter <a href="mailto:ki@sbsdeutschland.de" className="text-[#e85d04]">ki@sbsdeutschland.de</a>.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-2">7. Cookies</h2>
            <p>BelegFlow AI verwendet nur technisch notwendige Cookies und localStorage zur Authentifizierung (JWT-Token). Wir verwenden keine Tracking-Cookies oder Analyse-Tools von Drittanbietern.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-2">8. Hosting</h2>
            <p>Diese Website wird auf Servern von Vercel Inc. und DigitalOcean LLC gehostet. Die Datenverarbeitung erfolgt auf Servern in der EU (Frankfurt am Main).</p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-2">9. Änderungen</h2>
            <p>Diese Datenschutzerklärung wurde zuletzt am 14. März 2026 aktualisiert. Wir behalten uns vor, diese Datenschutzerklärung anzupassen.</p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/[0.06]">
          <Link href="/" className="text-sm text-[#e85d04] hover:text-[#f48c06]">← Zurück zur Startseite</Link>
        </div>
      </div>
    </div>
  );
}
