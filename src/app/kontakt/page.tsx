import Link from "next/link";
import type { Metadata } from "next";
import LeadForm from "@/components/LeadForm";
import IcpPathways from "@/components/IcpPathways";
import { getBookingCta } from "@/lib/booking";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontakt für Finance, Steuerberatung, IT, Datenschutz und Einkauf inkl. technischer Rückfragen und Unterlagenpfad.",
};

export default function KontaktPage() {
  const bookingCta = getBookingCta();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d4d4d4]">
      <nav className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e85d04] rounded-lg flex items-center justify-center font-bold text-white text-xs">
              BF
            </div>
            <span className="text-lg font-bold text-white" style={{ fontFamily: "'Instrument Serif',serif" }}>
              BelegFlow AI
            </span>
          </Link>
          <Link
            href="/demo"
            className="px-4 py-2 bg-[#e85d04] rounded-lg text-sm font-medium text-white hover:bg-[#f48c06] transition"
          >
            Demo anfragen
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-1 gap-8">
        <IcpPathways title="Direkte Wege für Finance, Steuerberatung und IT/Einkauf" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
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
                <a
                  href="/demo"
                  className="text-xs px-3 py-1.5 rounded-md border border-[#303030] text-[#a3a3a3] hover:text-white hover:border-[#e85d04]/60 transition"
                >
                  Demo für Finance
                </a>
                <a
                  href="/kontakt?reason=api"
                  className="text-xs px-3 py-1.5 rounded-md border border-[#303030] text-[#a3a3a3] hover:text-white hover:border-[#e85d04]/60 transition"
                >
                  Technische/API-Rückfrage
                </a>
                <a
                  href="/compliance"
                  className="text-xs px-3 py-1.5 rounded-md border border-[#303030] text-[#a3a3a3] hover:text-white hover:border-[#e85d04]/60 transition"
                >
                  Unterlagen für IT/Einkauf
                </a>
                <a
                  href="/guide"
                  className="text-xs px-3 py-1.5 rounded-md border border-[#303030] text-[#a3a3a3] hover:text-white hover:border-[#e85d04]/60 transition"
                >
                  DATEV-nahe Abläufe
                </a>
              </div>
            </div>

            <div className="bg-[#171717]/50 border border-[#262626] rounded-xl p-5 text-sm text-[#a3a3a3] space-y-2">
              <h2 className="text-sm font-semibold text-white">Hinweise zur Anfragebearbeitung</h2>
              <p>
                Ihre Angaben werden zur Bearbeitung Ihrer geschäftlichen Anfrage verarbeitet und intern an zuständige
                Fachbereiche übergeben.
              </p>
              <p>
                Aktuell erfolgt kein automatisierter CRM-Import ohne konfigurierte Integrationsparameter (Claim nur nach
                technischer Bestätigung veröffentlichen).
              </p>
              <p>
                Rückfragen auch per E-Mail: <a className="text-[#e85d04] hover:text-[#f48c06]" href="mailto:ki@sbsdeutschland.de">ki@sbsdeutschland.de</a>
              </p>
            </div>

            <div className="bg-[#171717]/50 border border-[#262626] rounded-xl p-5 text-sm text-[#a3a3a3] space-y-2">
              <h2 className="text-sm font-semibold text-white">Terminoption</h2>
              <p>
                Optionaler externer Buchungslink ist vorbereitet. Ohne Konfiguration wird auf Demo/Kontakt-Formulare
                geführt.
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
