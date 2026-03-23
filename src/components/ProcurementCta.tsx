import Link from "next/link";

const paths = [
  {
    title: "Für CFO & Finance",
    desc: "Kostenkontrolle, Freigaben, Budget-Tracking und DATEV-kompatibler Export für steuerberatende Workflows.",
    links: [
      { href: "/demo", label: "Demo anfragen" },
      { href: "/faq", label: "FAQ lesen" },
    ],
  },
  {
    title: "Für IT & Datenschutz",
    desc: "Sicherheitsmodell, Rollen- und Zugriffskontrolle, Audit-Log sowie API- und OpenAPI-Zugänge transparent einsehen.",
    links: [
      { href: "/sicherheit", label: "Sicherheit" },
      { href: "/compliance", label: "Compliance" },
    ],
  },
  {
    title: "Für Einkauf & Steuerberatung",
    desc: "AVV-Entwurf, Subprocessor-Hinweise und E-Rechnungsprozess von Empfang bis Export strukturiert prüfen.",
    links: [
      { href: "/avv", label: "AVV" },
      { href: "/guide", label: "E-Rechnung Guide" },
    ],
  },
];

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
          {paths.map((card) => (
            <div key={card.title} className="bg-[#171717]/70 border border-[#262626] rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-2">{card.title}</h3>
              <p className="text-sm text-[#a3a3a3] mb-4">{card.desc}</p>
              <div className="flex flex-wrap gap-2">
                {card.links.map((link) => (
                  <Link key={link.href} href={link.href} className="px-3 py-1.5 rounded-lg text-xs border border-[#303030] text-[#d4d4d4] hover:border-[#e85d04]/60 hover:text-white transition">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
