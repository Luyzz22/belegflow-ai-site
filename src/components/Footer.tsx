import Link from "next/link";

export default function Footer() {
  return (
    <footer className="px-6 py-12 border-t border-white/[0.06] bg-[#0a0a0a]">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-[#e85d04] rounded-lg flex items-center justify-center font-bold text-white text-[10px]">BF</div>
              <span className="text-sm font-bold text-white" style={{fontFamily:"'Instrument Serif',serif"}}>BelegFlow AI</span>
            </Link>
            <p className="text-xs text-[#525252] leading-relaxed">KI-Rechnungsverarbeitung für den deutschen Mittelstand.</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#737373] uppercase tracking-wider mb-3">Produkt</h4>
            <div className="space-y-2">
              {[["/#features","Features"],["/#preise","Preise"],["/guide","E-Rechnung Guide"],["/faq","FAQ"],["/api-docs","API Docs"],["/status","Status"]].map(([h,l])=>(
                <Link key={h} href={h} className="block text-xs text-[#525252] hover:text-[#a3a3a3] transition">{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#737373] uppercase tracking-wider mb-3">Trust Center</h4>
            <div className="space-y-2">
              {[["/sicherheit","Sicherheit"],["/compliance","Compliance"],["/avv","AVV"],["/referenzen","Referenzen"],["/datenschutz","Datenschutz"]].map(([h,l])=>(
                <Link key={h} href={h} className="block text-xs text-[#525252] hover:text-[#a3a3a3] transition">{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#737373] uppercase tracking-wider mb-3">Starten</h4>
            <div className="space-y-2">
              <Link href="/demo" className="block text-xs text-[#e85d04] hover:text-[#f48c06] font-medium transition">Demo anfragen</Link>
              <Link href="/kontakt" className="block text-xs text-[#e85d04] hover:text-[#f48c06] font-medium transition">Demo anfragen</Link>
              <a href="mailto:ki@sbsdeutschland.de" className="block text-xs text-[#525252] hover:text-[#a3a3a3] transition">Vertrieb kontaktieren</a>
              <Link href="/register" className="block text-xs text-[#525252] hover:text-[#a3a3a3] transition">Kostenlos registrieren</Link>
              <Link href="/login" className="block text-xs text-[#525252] hover:text-[#a3a3a3] transition">Anmelden</Link>
            </div>
          </div>
        </div>
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-[#404040]">© 2026 BelegFlow AI — Ein Produkt von SBS Deutschland GmbH & Co. KG</p>
          <p className="text-[11px] text-[#404040]">Rechenzentrum Frankfurt 🇩🇪 · DSGVO-orientierte Verarbeitung · GoBD-orientierte Prüfspur</p>
        </div>
      </div>
    </footer>
  );
}
