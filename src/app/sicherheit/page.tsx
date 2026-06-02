import type { Metadata } from "next";
import PublicPage from "@/components/PublicPage";

export const metadata: Metadata = {
  title: "Sicherheit & Compliance",
  description:
    "FlowCheck AI+ — Hosting in Deutschland, DSGVO-konform, GoBD-ready. Verschlüsselung, Audit-Trail und revisionssichere Archivierung.",
};

const PILLARS = [
  { icon: "🇩🇪", title: "Hosting in Deutschland", desc: "Alle Daten werden ausschließlich in deutschen Rechenzentren (Hetzner) verarbeitet und gespeichert." },
  { icon: "🔒", title: "DSGVO-konform", desc: "Verarbeitung nach Art. 28 DSGVO, AVV inklusive, vollständige Betroffenenrechte." },
  { icon: "📋", title: "GoBD-ready", desc: "Revisionssichere, unveränderbare Archivierung mit lückenlosem Audit-Trail." },
  { icon: "🔐", title: "Verschlüsselung", desc: "TLS 1.3 in der Übertragung, AES-256 im Ruhezustand." },
  { icon: "👥", title: "Rollen & Rechte", desc: "Granulare Rollen (Admin, Buchhaltung, Freigeber, Leser) und mehrstufige Freigaben." },
  { icon: "🧾", title: "Audit-Trail", desc: "Jede Aktion wird protokolliert und ist als CSV exportierbar." },
];

const CERTS = ["DSGVO", "GoBD", "§14 UStG", "EU AI Act", "ISO 27001 (Rechenzentrum)"];

export default function SicherheitPage() {
  return (
    <PublicPage
      title="Sicherheit & Compliance"
      subtitle="Ihre Rechnungsdaten gehören zu den sensibelsten Unternehmensdaten. Wir behandeln sie entsprechend."
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PILLARS.map((p) => (
          <div key={p.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/60">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#003856]/5 text-xl">
              {p.icon}
            </div>
            <h3 className="text-base font-semibold text-stone-800">{p.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-500">{p.desc}</p>
          </div>
        ))}
      </div>

      <section className="mt-12 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200/60">
        <h2 className="text-xl font-semibold text-[#003856]">Standards & Regelwerke</h2>
        <p className="mt-2 text-sm text-stone-500">
          FlowCheck AI+ ist auf die regulatorischen Anforderungen des deutschen Mittelstands ausgelegt.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {CERTS.map((c) => (
            <span
              key={c}
              className="rounded-lg bg-[#003856]/5 px-3 py-1.5 text-sm font-medium text-[#003856] ring-1 ring-[#003856]/10"
            >
              {c}
            </span>
          ))}
        </div>
      </section>
    </PublicPage>
  );
}
