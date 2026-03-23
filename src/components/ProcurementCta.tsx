export default function ProcurementCta() {
  return (
    <section className="px-6 py-16">
      <div className="max-w-[1100px] mx-auto">
        <div className="mb-8 text-center">
          <p className="text-[12px] uppercase tracking-[0.12em] text-[#e85d04] font-semibold mb-3">Procurement</p>
          <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Klare Entscheidungswege für Einkauf, IT und Finance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#171717]/70 border border-[#262626] rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-2">Für CFO & Finance</h3>
            <p className="text-sm text-[#a3a3a3] mb-4">
              Kostenkontrolle, Freigaben, Budget-Tracking und DATEV-kompatibler Export für steuerberatende Workflows.
            </p>
            <div className="flex flex-wrap gap-2">
              <a href="/demo" className="px-3 py-1.5 rounded-lg text-xs border border-[#303030] text-[#d4d4d4] hover:border-[#e85d04]/60 hover:text-white transition">Demo anfragen</a>
              <a href="/faq" className="px-3 py-1.5 rounded-lg text-xs border border-[#303030] text-[#d4d4d4] hover:border-[#e85d04]/60 hover:text-white transition">FAQ lesen</a>
            </div>
          </div>

          <div className="bg-[#171717]/70 border border-[#262626] rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-2">Für IT & Datenschutz</h3>
            <p className="text-sm text-[#a3a3a3] mb-4">
              Sicherheitsmodell, Rollen- und Zugriffskontrolle, Audit-Log sowie API- und OpenAPI-Zugänge transparent einsehen.
            </p>
            <div className="flex flex-wrap gap-2">
              <a href="/sicherheit" className="px-3 py-1.5 rounded-lg text-xs border border-[#303030] text-[#d4d4d4] hover:border-[#e85d04]/60 hover:text-white transition">Sicherheit</a>
              <a href="/compliance" className="px-3 py-1.5 rounded-lg text-xs border border-[#303030] text-[#d4d4d4] hover:border-[#e85d04]/60 hover:text-white transition">Compliance</a>
            </div>
          </div>

          <div className="bg-[#171717]/70 border border-[#262626] rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-2">Für Einkauf & Steuerberatung</h3>
            <p className="text-sm text-[#a3a3a3] mb-4">
              AVV-Entwurf, Subprocessor-Hinweise und E-Rechnungsprozess von Empfang bis Export strukturiert prüfen.
            </p>
            <div className="flex flex-wrap gap-2">
              <a href="/avv" className="px-3 py-1.5 rounded-lg text-xs border border-[#303030] text-[#d4d4d4] hover:border-[#e85d04]/60 hover:text-white transition">AVV</a>
              <a href="/guide" className="px-3 py-1.5 rounded-lg text-xs border border-[#303030] text-[#d4d4d4] hover:border-[#e85d04]/60 hover:text-white transition">E-Rechnung Guide</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
