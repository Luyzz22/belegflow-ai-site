import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Referenzen",
  description: "Geeignet-für-Profile, typische Einsatzszenarien und Pilot-/Referenzgespräch für den Mittelstand ohne Marketing-Übertreibung.",
};

export default function ReferenzenPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d4d4d4]">
      <div className="max-w-4xl mx-auto px-6 py-14 space-y-8">
        <header>
          <Link href="/" className="text-sm text-[#e85d04] hover:text-[#f48c06]">← Startseite</Link>
          <h1 className="text-4xl text-white mt-4 mb-3" style={{fontFamily:"'Instrument Serif',serif"}}>Referenzen & Einsatzfelder</h1>
          <p className="text-[#a3a3a3]">Wir veröffentlichen keine erfundenen Kundenlogos. Stattdessen zeigen wir, für welche Teams und Prozesse die Lösung typischerweise geeignet ist.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ["Geeignet für", ["Mittelständische Finance-Teams", "Steuerberatung-nahe Workflows", "Unternehmen mit hohem Belegvolumen"]],
            ["Typische Szenarien", ["E-Rechnungseingang strukturieren", "Freigabeprozesse mit Audit-Trail", "DATEV-kompatibler Export in Serien"]],
            ["Projektstart", ["Pilotphase mit begrenztem Scope", "Fachlicher Review von KI-Vorschlägen", "Übergabe in Regelbetrieb"]],
          ].map(([title, list]) => (
            <article key={String(title)} className="bg-[#171717]/60 border border-[#262626] rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white mb-2">{title as string}</h2>
              <ul className="text-sm text-[#a3a3a3] space-y-1 list-disc pl-5">
                {(list as string[]).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </section>

        <section className="bg-[#171717]/40 border border-[#262626] rounded-xl p-6">
          <h2 className="text-lg text-white mb-2" style={{fontFamily:"'Instrument Serif',serif"}}>Pilot- oder Referenzgespräch</h2>
          <p className="text-sm text-[#a3a3a3] mb-4">Auf Anfrage organisieren wir ein strukturiertes Gespräch zu Implementierung, Prozessfit und Risikobewertung. Referenzgespräche erfolgen nur mit Freigabe und unter Vertraulichkeit.</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/demo" className="px-4 py-2 bg-[#e85d04] rounded-lg text-sm text-white hover:bg-[#f48c06] transition">Referenzgespräch anfragen</Link>
            <Link href="/faq" className="px-4 py-2 border border-[#303030] rounded-lg text-sm hover:border-[#e85d04]/60 transition">FAQ</Link>
            <Link href="/guide" className="px-4 py-2 border border-[#303030] rounded-lg text-sm hover:border-[#e85d04]/60 transition">E-Rechnung Guide</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
