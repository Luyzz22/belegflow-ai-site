import type { Metadata } from "next";
import Link from "next/link";
import PublicPage from "@/components/PublicPage";
import Reveal from "@/components/landing/Reveal";
import TiltCard from "@/components/landing/TiltCard";

export const metadata: Metadata = {
  title: "Preise",
  description:
    "FlowCheck AI+ Preise: Starter €99, Professional €349, Enterprise €999 pro Monat. Transparent, ohne Setup-Kosten, 14 Tage kostenlos testen.",
};

const PLANS = [
  {
    tier: "Starter",
    price: "€99",
    sub: "pro Monat",
    desc: "Für kleine Teams, die den Rechnungseingang digitalisieren.",
    features: [
      "Bis 100 Rechnungen / Monat",
      "KI-Extraktion & §14 UStG-Prüfung",
      "DATEV-CSV-Export",
      "1 Benutzer",
      "E-Mail-Support",
    ],
    featured: false,
    contact: false,
  },
  {
    tier: "Professional",
    price: "€349",
    sub: "pro Monat",
    desc: "Für wachsende Unternehmen mit Freigabeprozessen.",
    features: [
      "Bis 500 Rechnungen / Monat",
      "Mehrstufige Freigaben",
      "Anomalie-Detection",
      "Lieferanten-Risiko-Score",
      "5 Benutzer",
      "Priorisierter Support",
    ],
    featured: true,
    contact: false,
  },
  {
    tier: "Enterprise",
    price: "€999",
    sub: "pro Monat",
    desc: "Für den Mittelstand mit Compliance-Anforderungen.",
    features: [
      "Unbegrenzte Rechnungen",
      "3-Wege-Match (Bestellung/Vertrag)",
      "Vollständiger Audit-Trail",
      "SSO / SAML",
      "Unbegrenzte Benutzer",
      "Dedicated Customer Success",
    ],
    featured: false,
    contact: true,
  },
];

const FAQ: [string, string][] = [
  ["Gibt es eine kostenlose Testphase?", "Ja, alle Pläne können 14 Tage kostenlos und ohne Kreditkarte getestet werden."],
  ["Kann ich den Plan monatlich wechseln?", "Ja, Up- und Downgrades sind jederzeit zum nächsten Abrechnungszeitraum möglich."],
  ["Wo werden meine Daten gespeichert?", "Ausschließlich in deutschen Rechenzentren (Hetzner, DE) — DSGVO- und GoBD-konform."],
  ["Ist ein DATEV-Export enthalten?", "Ja, in jedem Plan. Business unterstützt zusätzlich erweiterte Buchungslogiken."],
];

export default function PreisePage() {
  return (
    <PublicPage
      title="Preise"
      subtitle="Transparente Pläne ohne Setup-Kosten. 14 Tage kostenlos testen."
    >
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        {PLANS.map((p, i) => (
          <Reveal key={p.tier} delay={i * 100} className="h-full">
          <TiltCard
            max={5}
            className={`flex h-full flex-col rounded-2xl bg-white p-7 shadow-sm ring-1 transition-shadow hover:shadow-xl ${
              p.featured ? "ring-2 ring-[#003856]" : "ring-stone-200/60"
            }`}
          >
            {p.featured && (
              <span className="mb-3 self-start rounded-md bg-[#c8985a] px-2 py-0.5 text-xs font-semibold text-white">
                Beliebtester Plan
              </span>
            )}
            <h2 className="text-sm font-medium uppercase tracking-wide text-stone-400">{p.tier}</h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-[#003856]">
              {p.price}
              <span className="text-base font-normal text-stone-400"> {p.sub}</span>
            </p>
            <p className="mt-2 text-sm text-stone-500">{p.desc}</p>
            <ul className="mt-6 flex-1 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-stone-600">
                  <span className="mt-0.5 font-semibold text-emerald-600">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            {p.contact ? (
              <a
                href="mailto:ki@sbsdeutschland.de"
                className="mt-7 rounded-xl bg-stone-50 px-4 py-2.5 text-center text-sm font-medium text-[#003856] ring-1 ring-stone-200 transition hover:bg-stone-100"
              >
                Kontakt aufnehmen
              </a>
            ) : (
              <Link
                href="/register"
                className={`mt-7 rounded-xl px-4 py-2.5 text-center text-sm font-medium transition ${
                  p.featured
                    ? "bg-[#003856] text-white hover:bg-[#002a42]"
                    : "bg-stone-50 text-[#003856] ring-1 ring-stone-200 hover:bg-stone-100"
                }`}
              >
                14 Tage kostenlos testen
              </Link>
            )}
          </TiltCard>
          </Reveal>
        ))}
      </div>

      <section className="mt-16">
        <Reveal>
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#003856]">Häufige Fragen</h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FAQ.map(([q, a], i) => (
            <Reveal key={q} delay={i * 80} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/60">
              <h3 className="text-base font-semibold text-stone-800">{q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">{a}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </PublicPage>
  );
}
