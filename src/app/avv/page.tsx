import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AVV",
  description: "Informationen zur Auftragsverarbeitungsvereinbarung (AVV) für Beschaffung, Datenschutz und Rechtsprüfung.",
};

export default function AvvPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d4d4d4]">
      <div className="max-w-3xl mx-auto px-6 py-14 space-y-8">
        <header>
          <Link href="/" className="text-sm text-[#e85d04] hover:text-[#f48c06]">← Startseite</Link>
          <h1 className="text-4xl text-white mt-4 mb-3" style={{fontFamily:"'Instrument Serif',serif"}}>AVV (Auftragsverarbeitung)</h1>
          <p className="text-[#a3a3a3]">Diese Seite bietet einen strukturierten Überblick für Datenschutz, Einkauf und Legal. Eine finale AVV-Fassung wird erst nach juristischer Freigabe verbindlich.</p>
        </header>

        <section className="bg-[#171717]/60 border border-[#262626] rounded-xl p-6">
          <h2 className="text-lg text-white mb-3" style={{fontFamily:"'Instrument Serif',serif"}}>Aktueller Stand</h2>
          <ul className="space-y-2 text-sm text-[#a3a3a3] list-disc pl-5">
            <li>AVV-Unterlagen werden im Rahmen von Vertrieb/Onboarding bereitgestellt.</li>
            <li>Bis zur finalen Freigabe gelten Dokumente als Entwurf (juristisch prüfen).</li>
            <li>Datenschutzrollen, TOMs und Subprocessor-Liste sind Bestandteil des Prüfpakets.</li>
          </ul>
        </section>

        <section className="bg-[#171717]/60 border border-[#262626] rounded-xl p-6">
          <h2 className="text-lg text-white mb-3" style={{fontFamily:"'Instrument Serif',serif"}}>Subprocessor-Hinweis</h2>
          <p className="text-sm text-[#a3a3a3] mb-3">Eine aktuelle Liste von Unterauftragsverarbeitern wird als transparenter Platzhalter im Beschaffungsprozess bereitgestellt und fortlaufend gepflegt (DSB prüfen).</p>
          <p className="text-xs text-[#737373]">Hinweis: Änderungen werden nach interner Prüfung und rechtlicher Abstimmung kommuniziert.</p>
        </section>

        <section className="border border-[#262626] rounded-xl p-6">
          <h2 className="text-lg text-white mb-3" style={{fontFamily:"'Instrument Serif',serif"}}>Anfrageprozess</h2>
          <div className="space-y-2 text-sm text-[#a3a3a3]">
            <p>1) Anfrage per Kontaktformular mit Unternehmensdaten und Prüfanforderungen.</p>
            <p>2) Versand des Prüfpakets (AVV-Entwurf, Datenschutzinfos, technische Einordnung).</p>
            <p>3) Fachliche und juristische Klärung mit Einkauf, DSB und Legal.</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Link href="/kontakt" className="px-4 py-2 bg-[#e85d04] rounded-lg text-sm text-white hover:bg-[#f48c06] transition">AVV anfragen</Link>
            <Link href="/compliance" className="px-4 py-2 border border-[#303030] rounded-lg text-sm hover:border-[#e85d04]/60 transition">Compliance-Überblick</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
