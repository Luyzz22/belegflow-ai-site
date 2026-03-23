import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sicherheit",
  description: "Sicherheitsüberblick von BelegFlow AI: Hosting, Zugriffskontrolle, Logging, Audit-Trail, Backup/Recovery und Security-Kontakt.",
};

export default function SicherheitPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d4d4d4]">
      <nav className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e85d04] rounded-lg flex items-center justify-center font-bold text-white text-xs">BF</div>
            <span className="text-lg font-bold text-white" style={{fontFamily:"'Instrument Serif',serif"}}>BelegFlow AI</span>
          </Link>
          <Link href="/kontakt" className="px-4 py-2 bg-[#e85d04] rounded-lg text-sm font-medium text-white hover:bg-[#f48c06] transition">Security-Kontakt</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-14 space-y-8">
        <header>
          <h1 className="text-4xl text-white mb-3" style={{fontFamily:"'Instrument Serif',serif"}}>Sicherheit</h1>
          <p className="text-[#a3a3a3]">Dieser Überblick beschreibt unser aktuelles Sicherheits- und Betriebsmodell auf hohem Niveau. Detailmaßnahmen können sich weiterentwickeln (Claim nur nach technischer Bestätigung veröffentlichen).</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ["Hosting & Betrieb", "Cloud-Betrieb mit Fokus auf Datenverarbeitung in Deutschland. Infrastruktur-Details, Standorte und Anbieterabhängigkeiten werden bei Bedarf im Beschaffungsprozess transparent gemacht (juristisch prüfen / DSB prüfen)."],
            ["Zugriffskontrolle", "Rollenbasierte Zugriffe (z. B. Admin/Editor/Viewer) und Tenant-Trennung unterstützen die organisatorische Zugriffskontrolle."],
            ["Logging & Audit-Trail", "Ereignisse entlang des Rechnungsprozesses werden protokolliert, um Nachvollziehbarkeit von Upload bis Export zu unterstützen (GoBD-orientierte Prüfspur)."],
            ["Backup & Recovery", "Datensicherungen und Wiederanlaufprozesse werden betrieben; konkrete RTO/RPO-Zusagen erfolgen nur vertraglich und nach technischer Bestätigung."],
          ].map(([title, text]) => (
            <article key={title} className="bg-[#171717]/70 border border-[#262626] rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white mb-2">{title}</h2>
              <p className="text-sm text-[#a3a3a3]">{text}</p>
            </article>
          ))}
        </section>

        <section className="bg-[#171717]/40 border border-[#262626] rounded-xl p-6">
          <h2 className="text-lg text-white mb-2" style={{fontFamily:"'Instrument Serif',serif"}}>Disclosure & Kontakt</h2>
          <p className="text-sm text-[#a3a3a3] mb-4">Sicherheitsrelevante Hinweise oder Fragen können über den offiziellen Kontaktweg gemeldet werden.</p>
          <div className="flex flex-wrap gap-2">
            <a href="mailto:ki@sbsdeutschland.de?subject=Security%20Disclosure%20BelegFlow" className="px-4 py-2 bg-[#e85d04] rounded-lg text-sm text-white hover:bg-[#f48c06] transition">security@ via Kontaktweg</a>
            <Link href="/api-docs" className="px-4 py-2 border border-[#303030] rounded-lg text-sm hover:border-[#e85d04]/60 transition">API / Swagger</Link>
            <Link href="/compliance" className="px-4 py-2 border border-[#303030] rounded-lg text-sm hover:border-[#e85d04]/60 transition">Compliance</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
