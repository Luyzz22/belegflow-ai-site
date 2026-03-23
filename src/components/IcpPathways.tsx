import Link from "next/link";

type IcpPathwaysProps = {
  title?: string;
  className?: string;
};

const pathways = [
  {
    segment: "CFO / Finance",
    description:
      "Demo für Finance-Prozesse, Freigaben, Audit-Trail und wirtschaftlichen Rollout im Mittelstand.",
    actions: [
      { href: "/demo?track=finance", label: "Demo für Finance anfragen" },
      { href: "/referenzen", label: "Use Case besprechen" },
    ],
  },
  {
    segment: "Steuerberater / Kanzlei",
    description:
      "Ablauf für Steuerberater und DATEV-Workflows mit prüf- und korrigierbaren KI-Vorschlägen.",
    actions: [
      { href: "/guide", label: "DATEV-Workflow ansehen" },
      { href: "/kontakt?track=steuerberater", label: "Produktgespräch vereinbaren" },
    ],
  },
  {
    segment: "IT / Datenschutz / Einkauf",
    description:
      "Unterlagen für IT und Einkauf, technische Rückfragen sowie API-/Sicherheitsprüfung in klaren Pfaden.",
    actions: [
      { href: "/compliance", label: "Unterlagen für IT und Einkauf" },
      { href: "/kontakt?reason=api", label: "Technische Rückfrage senden" },
    ],
  },
];

export default function IcpPathways({ title = "Segmentierte Wege für Ihr Team", className = "" }: IcpPathwaysProps) {
  return (
    <section className={className}>
      <h2 className="text-lg text-white mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pathways.map((pathway) => (
          <article key={pathway.segment} className="bg-[#171717]/60 border border-[#262626] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2">{pathway.segment}</h3>
            <p className="text-sm text-[#a3a3a3] mb-4">{pathway.description}</p>
            <div className="flex flex-wrap gap-2">
              {pathway.actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="text-xs px-3 py-1.5 rounded-md border border-[#303030] text-[#d4d4d4] hover:border-[#e85d04]/60 hover:text-white transition"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
