import Link from "next/link";
import type { Metadata } from "next";
import LeadForm from "@/components/LeadForm";
import IcpPathways from "@/components/IcpPathways";
import { getBookingCta } from "@/lib/booking";

export const metadata: Metadata = {
  title: "Demo anfragen",
  description:
    "Produktgespräch und Demo für Finance, IT, Datenschutz und Einkauf – strukturiert und DSGVO-sensibel.",
};

export default function DemoPage() {
  const bookingCta = getBookingCta();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d4d4d4]">
      <div className="max-w-6xl mx-auto px-6 py-14 space-y-8">
        <header className="text-center">
          <Link href="/" className="text-sm text-[#e85d04] hover:text-[#f48c06]">
            ← Startseite
          </Link>
          <h1 className="text-4xl text-white mt-4 mb-3" style={{ fontFamily: "'Instrument Serif',serif" }}>
            Demo anfragen
          </h1>
          <p className="text-[#a3a3a3] max-w-3xl mx-auto">
            Wir strukturieren das Gespräch entlang Ihrer Rolle: Finance, Steuerberatung/DATEV-Workflows oder
            IT/Datenschutz/Einkauf. So erhalten Sie direkt die relevanten Unterlagen und Antworten.
          </p>
        </header>

        <IcpPathways />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <LeadForm
              defaultReason="demo"
              title="Demo-Anfrage erfassen"
              subtitle="Geben Sie nur die Informationen an, die für das Erstgespräch nötig sind. Keine Marketing-Einwilligung erforderlich."
            />
          </div>
          <aside className="lg:col-span-2 space-y-4">
            <div className="bg-[#171717]/50 border border-[#262626] rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white mb-2">Vorab-Unterlagen</h2>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/sicherheit"
                  className="text-xs px-3 py-1.5 rounded-md border border-[#303030] text-[#a3a3a3] hover:text-white hover:border-[#e85d04]/60 transition"
                >
                  Sicherheit
                </Link>
                <Link
                  href="/compliance"
                  className="text-xs px-3 py-1.5 rounded-md border border-[#303030] text-[#a3a3a3] hover:text-white hover:border-[#e85d04]/60 transition"
                >
                  Compliance
                </Link>
                <Link
                  href="/avv"
                  className="text-xs px-3 py-1.5 rounded-md border border-[#303030] text-[#a3a3a3] hover:text-white hover:border-[#e85d04]/60 transition"
                >
                  AVV
                </Link>
                <Link
                  href="/api-docs"
                  className="text-xs px-3 py-1.5 rounded-md border border-[#303030] text-[#a3a3a3] hover:text-white hover:border-[#e85d04]/60 transition"
                >
                  API / OpenAPI
                </Link>
              </div>
            </div>
            <div className="bg-[#171717]/50 border border-[#262626] rounded-xl p-5 text-sm text-[#a3a3a3] space-y-2">
              <h2 className="text-sm font-semibold text-white">Sales-Handoff</h2>
              <p>
                Anfragen werden serverseitig validiert und über eine vorbereitete Adapter-Struktur an Webhook/CRM/
                Notification übergeben, sobald konfiguriert.
              </p>
              <p>
                Ohne aktive Integrationsparameter bleibt die Erfassung als sichere Zwischenlösung aktiv (juristisch
                prüfen / DSB prüfen).
              </p>
            </div>
            <div className="bg-[#171717]/50 border border-[#262626] rounded-xl p-5 text-sm text-[#a3a3a3] space-y-2">
              <h2 className="text-sm font-semibold text-white">Optionale Terminbuchung</h2>
              <p>
                Es ist kein Buchungssystem fest eingebaut. Über <code>NEXT_PUBLIC_BOOKING_URL</code> kann ein externer
                Terminlink aktiviert werden.
              </p>
              {bookingCta.external ? (
                <a href={bookingCta.href} target="_blank" rel="noopener noreferrer" className="inline-flex px-3 py-2 rounded-lg border border-[#303030] hover:border-[#e85d04]/60 text-white transition">
                  {bookingCta.label}
                </a>
              ) : (
                <Link href={bookingCta.href} className="inline-flex px-3 py-2 rounded-lg border border-[#303030] hover:border-[#e85d04]/60 text-white transition">
                  {bookingCta.label}
                </Link>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
