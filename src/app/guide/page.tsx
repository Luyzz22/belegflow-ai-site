import Link from "next/link";
import type { Metadata } from "next";
import ProcurementCta from "@/components/ProcurementCta";

export const metadata: Metadata = {
  title: "E-Rechnung Guide 2026 — Empfangspflicht, Übergangsfristen, Umsetzung",
  description: "Praxis-Guide zur E-Rechnung: Empfangspflicht seit 01.01.2025, Versandpflicht mit Übergangsfristen sowie Verarbeitung, Validierung, Archivierung und Export.",
};

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d4d4d4]">
      <nav className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e85d04] rounded-lg flex items-center justify-center font-bold text-white text-xs">BF</div>
            <span className="text-lg font-bold text-white" style={{fontFamily:"'Instrument Serif',serif"}}>BelegFlow AI</span>
          </Link>
          <Link href="/register" className="px-4 py-2 bg-[#e85d04] rounded-lg text-sm font-medium text-white hover:bg-[#f48c06] transition">Kostenlos testen</Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e85d04]/10 border border-[#e85d04]/20 rounded-full text-xs text-[#f48c06] font-medium mb-4">📋 Guide · 8 Min Lesezeit</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4" style={{fontFamily:"'Instrument Serif',serif"}}>E-Rechnung in Deutschland:<br/>Der kompakte Praxis-Guide</h1>
          <p className="text-lg text-[#a3a3a3] leading-relaxed">Die Empfangspflicht gilt seit dem 1. Januar 2025. Die Versandpflicht wird über Übergangsfristen gestaffelt eingeführt. Hier sehen Sie die wichtigsten Punkte für Ihr B2B-Team.</p>
        </div>

        <div className="space-y-12 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4" style={{fontFamily:"'Instrument Serif',serif"}}>Was ist eine E-Rechnung?</h2>
            <p className="mb-4">Eine E-Rechnung ist eine Rechnung in einem strukturierten elektronischen Format, das die automatische Verarbeitung ermöglicht. Wichtig: Ein PDF per E-Mail ist keine E-Rechnung im Sinne des Gesetzes. E-Rechnungen müssen in einem maschinenlesbaren Format wie XRechnung oder ZUGFeRD vorliegen.</p>
            <div className="bg-[#171717]/50 border border-[#262626] rounded-xl p-6 my-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><h3 className="text-sm font-semibold text-white mb-2">✅ E-Rechnung</h3><p className="text-sm text-[#737373]">XRechnung (XML), ZUGFeRD 2.1 (PDF+XML), EN 16931 konforme Formate</p></div>
                <div><h3 className="text-sm font-semibold text-white mb-2">❌ Keine E-Rechnung</h3><p className="text-sm text-[#737373]">PDF per Email, Scan einer Papierrechnung, Word/Excel Dateien</p></div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4" style={{fontFamily:"'Instrument Serif',serif"}}>Wer ist betroffen?</h2>
            <p className="mb-4">Betroffen sind grundsätzlich B2B-Unternehmen in Deutschland. Die Empfangspflicht gilt seit 01.01.2025. Für den Versand gelten gestaffelte Übergangsfristen. Die konkrete Auslegung für Sonderfälle sollte juristisch geprüft und steuerlich validiert werden.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4" style={{fontFamily:"'Instrument Serif',serif"}}>Der Zeitplan</h2>
            <div className="space-y-4">
              {[
                {date:"01.01.2025",title:"Empfangspflicht aktiv",desc:"B2B-Unternehmen müssen elektronische Rechnungen empfangen können."},
                {date:"2025–2027",title:"Übergangsphase Versand",desc:"Für den Versand gelten gestaffelte Übergangsregeln (u. a. Unternehmensgröße und Formatvorgaben)."},
                {date:"ab 2028",title:"Regelbetrieb",desc:"E-Rechnungsversand wird im Regelfall verbindlich. Detailausnahmen sollten laufend fachlich geprüft werden."},
              ].map((s,i)=>(
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-20 shrink-0 text-sm font-semibold text-[#e85d04]">{s.date}</div>
                  <div className="flex-1 bg-[#171717]/50 border border-[#262626] rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-white mb-1">{s.title}</h3>
                    <p className="text-sm text-[#737373]">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#737373] mt-4">Hinweis: Für konkrete Einzelfälle zu Übergangsfristen und Ausnahmen gilt: juristisch prüfen / steuerlich validieren.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4" style={{fontFamily:"'Instrument Serif',serif"}}>Empfang bis Export: Die 5 Schritte</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {t:"1) Empfang",d:"Annahme strukturierter Formate wie XRechnung oder ZUGFeRD."},
                {t:"2) Verarbeitung",d:"Extraktion, Klassifikation und Zuordnung in den Rechnungsworkflow."},
                {t:"3) Validierung",d:"Formale und inhaltliche Prüfungen (z. B. KoSIT-nahe Validierung)."},
                {t:"4) Archivierung",d:"Nachvollziehbare, unveränderbare Ablage mit Prüfspur (GoBD-orientiert)."},
                {t:"5) Export",d:"Übergabe an Steuerberatung/FiBu über DATEV-kompatible Exporte."},
              ].map((item, i) => (
                <div key={i} className="bg-[#171717]/50 border border-[#262626] rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-white mb-1">{item.t}</h3>
                  <p className="text-sm text-[#737373]">{item.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4" style={{fontFamily:"'Instrument Serif',serif"}}>XRechnung vs. ZUGFeRD</h2>
            <p className="mb-4">Die zwei wichtigsten E-Rechnungsformate in Deutschland sind XRechnung und ZUGFeRD. Beide sind EN 16931 konform, unterscheiden sich aber in der Umsetzung.</p>
            <div className="bg-[#171717]/50 border border-[#262626] rounded-xl overflow-hidden my-6">
              <div className="grid grid-cols-3 gap-px bg-[#262626]">
                <div className="bg-[#0a0a0a] p-4 text-sm font-semibold text-white">Merkmal</div>
                <div className="bg-[#0a0a0a] p-4 text-sm font-semibold text-white">XRechnung</div>
                <div className="bg-[#0a0a0a] p-4 text-sm font-semibold text-white">ZUGFeRD 2.1</div>
                {[
                  ["Format","Reines XML","PDF + eingebettetes XML"],
                  ["Lesbarkeit","Nur maschinell","Mensch + Maschine"],
                  ["Einsatz","Öffentliche Auftraggeber","B2B & B2G"],
                  ["Validierung","KoSIT Prüftool","Mustang / BelegFlow"],
                ].map(([m,x,z],i)=>(
                  <>{[m,x,z].map((v,j)=><div key={i+"-"+j} className="bg-[#0f0f0f] p-4 text-sm text-[#a3a3a3]">{v}</div>)}</>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4" style={{fontFamily:"'Instrument Serif',serif"}}>GoBD-orientierte Prüfspur</h2>
            <p className="mb-4">Die GoBD (Grundsätze zur ordnungsmäßigen Führung und Aufbewahrung von Büchern) stellen Anforderungen an die revisionssichere Archivierung elektronischer Belege. Jede E-Rechnung muss nachvollziehbar, unveränderbar und maschinell auswertbar archiviert werden.</p>
            <p>BelegFlow AI setzt auf Audit-Trails, technische Nachvollziehbarkeit und KoSIT-validierungsnahe Verarbeitungsschritte. Aussagen zur formalen Compliance sollten je nach Einsatzkontext juristisch geprüft und steuerlich validiert werden.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4" style={{fontFamily:"'Instrument Serif',serif"}}>So bereiten Sie sich vor</h2>
            <div className="space-y-3">
              {[
                {n:"1",t:"Bestandsaufnahme",d:"Analysieren Sie Ihren aktuellen Rechnungseingang. Wie viele Rechnungen erhalten Sie monatlich? In welchen Formaten?"},
                {n:"2",t:"Software evaluieren",d:"Wählen Sie eine Lösung, die XRechnung und ZUGFeRD unterstützt, eine GoBD-orientierte Prüfspur bietet und DATEV-kompatibel exportiert."},
                {n:"3",t:"Prozesse anpassen",d:"Definieren Sie Freigabe-Workflows und Zuständigkeiten. Wer prüft, wer genehmigt, wer exportiert?"},
                {n:"4",t:"Team schulen",d:"Stellen Sie sicher, dass Ihre Buchhaltung mit dem neuen System vertraut ist."},
                {n:"5",t:"Testphase starten",d:"Beginnen Sie jetzt mit der automatisierten Verarbeitung — nicht erst im Januar 2027."},
              ].map((s,i)=>(
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#e85d04] flex items-center justify-center text-sm font-bold text-white shrink-0">{s.n}</div>
                  <div><h3 className="text-sm font-semibold text-white mb-1">{s.t}</h3><p className="text-sm text-[#737373]">{s.d}</p></div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gradient-to-r from-[#e85d04]/10 to-[#171717] border border-[#e85d04]/20 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3" style={{fontFamily:"'Instrument Serif',serif"}}>Bereit für die E-Rechnungspflicht?</h2>
            <p className="text-[#a3a3a3] mb-6 max-w-md mx-auto">Starten Sie jetzt mit BelegFlow AI — kostenloser Starter-Plan, keine Einrichtungskosten, in 5 Minuten startklar.</p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/register" className="px-6 py-3 bg-[#e85d04] hover:bg-[#f48c06] rounded-xl text-sm font-semibold text-white transition">Kostenlos starten</Link>
              <a href="mailto:ki@sbsdeutschland.de" className="px-6 py-3 border border-[#262626] rounded-xl text-sm text-[#a3a3a3] hover:text-white transition">Demo anfordern</a>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.06]">
          <Link href="/" className="text-sm text-[#e85d04] hover:text-[#f48c06]">← Zurück zur Startseite</Link>
        </div>
      </article>
      <ProcurementCta />
    </div>
  );
}
