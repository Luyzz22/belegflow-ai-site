import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compliance",
  description: "Compliance-Überblick zu E-Rechnungsverarbeitung, Datenschutzrollen, Audit-Trail und regulatorischer Einordnung bei BelegFlow AI.",
};

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d4d4d4]">
      <div className="max-w-4xl mx-auto px-6 py-14 space-y-8">
        <header>
          <Link href="/" className="text-sm text-[#e85d04] hover:text-[#f48c06]">← Startseite</Link>
          <h1 className="text-4xl text-white mt-4 mb-3" style={{fontFamily:"'Instrument Serif',serif"}}>Compliance</h1>
          <p className="text-[#a3a3a3]">Diese Seite dient als procurement-tauglicher Überblick. Sie ist kein Rechts- oder Steuergutachten und ersetzt keine individuelle Bewertung (juristisch prüfen / steuerlich validieren).</p>
        </header>

        <section className="bg-[#171717]/60 border border-[#262626] rounded-xl p-6">
          <h2 className="text-lg text-white mb-3" style={{fontFamily:"'Instrument Serif',serif"}}>E-Rechnung: Einordnung</h2>
          <ul className="space-y-2 text-sm text-[#a3a3a3] list-disc pl-5">
            <li>Empfangspflicht im B2B-Kontext seit 01.01.2025.</li>
            <li>Versandpflicht mit Übergangsfristen; konkrete Anwendung im Einzelfall juristisch prüfen.</li>
            <li>Unterstützung strukturierter Formate wie XRechnung und ZUGFeRD im Prozesskontext.</li>
            <li>KoSIT-Validierung als technischer Validierungsschritt im E-Rechnungsworkflow.</li>
          </ul>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="bg-[#171717]/60 border border-[#262626] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-2">Datenschutzrollen</h2>
            <p className="text-sm text-[#a3a3a3]">In typischen SaaS-Setups agiert der Kunde als Verantwortlicher und der Anbieter als Auftragsverarbeiter. Die konkrete Rollenverteilung ist vertraglich festzulegen (DSB prüfen).</p>
          </article>
          <article className="bg-[#171717]/60 border border-[#262626] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-2">GoBD-orientierte Prüfspur</h2>
            <p className="text-sm text-[#a3a3a3]">Der Workflow unterstützt nachvollziehbare Ereignisketten über Audit- und Event-Logs. Ein pauschaler Konformitätsclaim sollte nur mit belastbarer Prüfung veröffentlicht werden.</p>
          </article>
          <article className="bg-[#171717]/60 border border-[#262626] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-2">KI-Einsatz</h2>
            <p className="text-sm text-[#a3a3a3]">KI-Kontierung nach SKR03/SKR04 liefert Vorschläge mit Begründung und Confidence. Ergebnisse sind als Entscheidungshilfe prüf- und korrigierbar.</p>
          </article>
          <article className="bg-[#171717]/60 border border-[#262626] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-2">Export & Integration</h2>
            <p className="text-sm text-[#a3a3a3]">DATEV-kompatibler Export unterstützt die Zusammenarbeit mit Steuerberatung und DATEV-nahen Workflows. Details bitte im Fachtest validieren.</p>
          </article>
        </section>

        <section className="border border-[#262626] rounded-xl p-6">
          <h2 className="text-lg text-white mb-3" style={{fontFamily:"'Instrument Serif',serif"}}>Beschaffungs-Shortlist</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/avv" className="px-4 py-2 bg-[#e85d04] rounded-lg text-sm text-white hover:bg-[#f48c06] transition">AVV-Informationen</Link>
            <Link href="/sicherheit" className="px-4 py-2 border border-[#303030] rounded-lg text-sm hover:border-[#e85d04]/60 transition">Sicherheitsseite</Link>
            <Link href="/api-docs" className="px-4 py-2 border border-[#303030] rounded-lg text-sm hover:border-[#e85d04]/60 transition">API / OpenAPI</Link>
            <Link href="/kontakt" className="px-4 py-2 border border-[#303030] rounded-lg text-sm hover:border-[#e85d04]/60 transition">Vertrieb kontaktieren</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
