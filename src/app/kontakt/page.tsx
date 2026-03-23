import Link from "next/link";
import LeadForm from "@/components/LeadForm";

export default function KontaktPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d4d4d4]">
      <nav className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e85d04] rounded-lg flex items-center justify-center font-bold text-white text-xs">BF</div>
            <span className="text-lg font-bold text-white" style={{fontFamily:"'Instrument Serif',serif"}}>BelegFlow AI</span>
          </Link>
          <Link href="/demo" className="px-4 py-2 bg-[#e85d04] rounded-lg text-sm font-medium text-white hover:bg-[#f48c06] transition">Demo anfragen</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <LeadForm
            defaultReason="kontakt"
            title="Kontakt & Produktgespräch"
            subtitle="Für qualifizierte B2B-Anfragen zu Finance-, IT-, Datenschutz- oder Einkaufsanforderungen."
          />
        </div>

        <aside className="lg:col-span-2 space-y-4">
          <div className="bg-[#171717]/50 border border-[#262626] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-2">Direkte Kontaktpfade</h2>
            <div className="flex flex-wrap gap-2">
              <a href="/demo" className="text-xs px-3 py-1.5 rounded-md border border-[#303030] text-[#a3a3a3] hover:text-white hover:border-[#e85d04]/60 transition">Demo für Finance</a>
              <a href="/api-docs" className="text-xs px-3 py-1.5 rounded-md border border-[#303030] text-[#a3a3a3] hover:text-white hover:border-[#e85d04]/60 transition">Technische/API-Rückfrage</a>
              <a href="/compliance" className="text-xs px-3 py-1.5 rounded-md border border-[#303030] text-[#a3a3a3] hover:text-white hover:border-[#e85d04]/60 transition">Unterlagen für IT/Einkauf</a>
              <a href="/guide" className="text-xs px-3 py-1.5 rounded-md border border-[#303030] text-[#a3a3a3] hover:text-white hover:border-[#e85d04]/60 transition">DATEV-nahe Abläufe</a>
            </div>
          </div>

          <div className="bg-[#171717]/50 border border-[#262626] rounded-xl p-5 text-sm text-[#a3a3a3] space-y-2">
            <h2 className="text-sm font-semibold text-white">Hinweise zur Anfragebearbeitung</h2>
            <p>Ihre Angaben werden zur Bearbeitung Ihrer geschäftlichen Anfrage verarbeitet und intern an zuständige Fachbereiche übergeben.</p>
            <p>Aktuell erfolgt kein automatisierter CRM-Import ohne konfigurierte Webhook-Integration (Claim nur nach technischer Bestätigung veröffentlichen).</p>
            <p>
              Rückfragen auch per E-Mail: <a className="text-[#e85d04] hover:text-[#f48c06]" href="mailto:ki@sbsdeutschland.de">ki@sbsdeutschland.de</a>
            </p>
            <div className="lg:col-span-2 space-y-4">
              {[
                {icon:"📧",title:"E-Mail",desc:"ki@sbsdeutschland.de",href:"mailto:ki@sbsdeutschland.de"},
                {icon:"🌐",title:"Website",desc:"sbsdeutschland.com",href:"https://sbsdeutschland.com"},
                {icon:"📍",title:"Standort",desc:"Heiligkreuzsteinach, BW",href:null},
                {icon:"⏱",title:"Antwortzeit",desc:"Innerhalb von 24h",href:null},
              ].map((c,i)=>(
                <div key={i} className="bg-[#171717]/50 border border-[#262626] rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{c.icon}</span>
                    <div>
                      <p className="text-xs text-[#525252]">{c.title}</p>
                      {c.href ? <a href={c.href} className="text-sm text-[#e85d04] hover:text-[#f48c06]">{c.desc}</a> : <p className="text-sm text-[#d4d4d4]">{c.desc}</p>}
                    </div>
                  </div>
                </div>
              ))}
              <div className="bg-gradient-to-br from-[#e85d04]/10 to-[#171717] border border-[#e85d04]/20 rounded-xl p-5 text-center">
                <p className="text-sm font-medium text-white mb-2">Lieber gleich loslegen?</p>
                <Link href="/register" className="inline-flex px-5 py-2 bg-[#e85d04] rounded-lg text-sm font-medium text-white hover:bg-[#f48c06] transition">Kostenlos registrieren</Link>
              </div>
              <div className="bg-[#171717]/50 border border-[#262626] rounded-xl p-4">
                <p className="text-xs text-[#525252] mb-2">Beschaffung & Prüfung</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["/sicherheit", "Sicherheit"],
                    ["/compliance", "Compliance"],
                    ["/avv", "AVV"],
                    ["/faq", "FAQ"],
                    ["/api-docs", "API"],
                  ].map(([href, label]) => (
                    <Link key={href} href={href} className="text-xs px-2.5 py-1 rounded-md border border-[#303030] text-[#a3a3a3] hover:text-white hover:border-[#e85d04]/60 transition">{label}</Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
