import Link from "next/link";

export default function ImpressumPage() {
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
        <h1 className="text-3xl font-bold text-white mb-8" style={{fontFamily:"'Instrument Serif',serif"}}>Impressum</h1>
        <div className="space-y-6 text-sm leading-relaxed">
          <div>
            <h2 className="text-white font-semibold mb-2">Angaben gemäß § 5 TMG</h2>
            <p>SBS Deutschland GmbH & Co. KG<br/>Heiligkreuzsteinach<br/>Baden-Württemberg, Deutschland</p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-2">Kontakt</h2>
            <p>E-Mail: <a href="mailto:ki@sbsdeutschland.de" className="text-[#e85d04] hover:text-[#f48c06]">ki@sbsdeutschland.de</a><br/>Web: <a href="https://sbsdeutschland.com" className="text-[#e85d04] hover:text-[#f48c06]">sbsdeutschland.com</a></p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p>Luis Schenk<br/>Digitalisierung & KI<br/>SBS Deutschland GmbH & Co. KG</p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-2">Haftungsausschluss</h2>
            <p>Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-2">Streitschlichtung</h2>
            <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr" className="text-[#e85d04] hover:text-[#f48c06]" target="_blank" rel="noopener">https://ec.europa.eu/consumers/odr</a>. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/[0.06]">
          <Link href="/" className="text-sm text-[#e85d04] hover:text-[#f48c06]">← Zurück zur Startseite</Link>
        </div>
      </div>
    </div>
  );
}
