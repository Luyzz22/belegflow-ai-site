import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import PublicPage from "@/components/PublicPage";
import Reveal from "@/components/landing/Reveal";
import TiltCard from "@/components/landing/TiltCard";

export const metadata: Metadata = {
  title: "Preise",
  description:
    "FlowCheck AI+ Preise: Starter €99, Professional €349, Enterprise €999, Kanzlei auf Anfrage. 14 Tage kostenlos ohne Kreditkarte.",
};

const PLANS = [
  {
    tier: "Starter",
    price: "€99",
    sub: "pro Monat",
    desc: "Für kleine Teams, die den Rechnungseingang digitalisieren und die E-Rechnungspflicht erfüllen.",
    features: [
      "Bis 100 Rechnungen / Monat",
      "KI-Extraktion & §14 UStG-Prüfung",
      "SKR03/04 Kontierungsvorschlag (Gemini 2.5 Flash)",
      "DATEV-kompatibler CSV-Export (EXTF 700)",
      "KoSIT-Validierung (EN 16931)",
      "Duplikaterkennung (SHA-256 + Fuzzy)",
      "1 Benutzer",
      "E-Mail-Support",
    ],
    featured: false,
    contact: false,
    badge: null,
  },
  {
    tier: "Professional",
    price: "€349",
    sub: "pro Monat",
    desc: "Für wachsende Unternehmen mit Finance-Intelligence-Bedarf und mehrstufigen Freigaben.",
    features: [
      "Bis 500 Rechnungen / Monat",
      "Alles aus Starter, plus:",
      "Finance Copilot (KI-Chat, Claude Sonnet 4)",
      "Budget Tracking (8 SKR-Kategorien)",
      "Spend Analytics mit Visualisierungen",
      "Anomalie-Detection",
      "Mehrstufige Freigaben",
      "Lieferanten-Risiko-Score",
      "5 Benutzer",
      "Priorisierter Support",
    ],
    featured: true,
    contact: false,
    badge: "Beliebtester Plan",
  },
  {
    tier: "Enterprise",
    price: "€999",
    sub: "pro Monat",
    desc: "Für den Mittelstand mit Compliance- und Integrations-Anforderungen.",
    features: [
      "Unbegrenzte Rechnungen",
      "Alles aus Professional, plus:",
      "3-Wege-Match (Bestellung/Lieferschein/Rechnung)",
      "Vollständiger Audit-Trail (GoBD-Prüfspur)",
      "SSO / SAML (in Vorbereitung)",
      "API-Zugang",
      "Unbegrenzte Benutzer",
      "SLA 99,5 %",
      "Dedicated Customer Success",
    ],
    featured: false,
    contact: false,
    badge: null,
  },
  {
    tier: "Kanzlei",
    price: "Auf Anfrage",
    sub: "",
    desc: "Für Steuerberatungskanzleien mit mehreren Mandanten und DATEV-Workflow-Anforderungen.",
    features: [
      "Multi-Mandanten-Management",
      "DATEV-Export je Mandant",
      "Whitelabel-Option",
      "Eigene Kontierungsregeln je Mandant",
      "Sammel-DATEV-Export (Batch)",
      "Mandantentrennende Archivierung",
      "Dedizierter Account Manager",
      "SLA 99,5 %",
    ],
    featured: false,
    contact: true,
    badge: "Für Kanzleien",
  },
];

const FEATURE_MATRIX: { category: string; features: { label: string; starter: boolean | string; professional: boolean | string; enterprise: boolean | string; kanzlei: boolean | string }[] }[] = [
  {
    category: "KI & Extraktion",
    features: [
      { label: "Gemini 2.5 Flash Kontierung (SKR03/04)", starter: true, professional: true, enterprise: true, kanzlei: true },
      { label: "Claude Sonnet 4 Fallback", starter: true, professional: true, enterprise: true, kanzlei: true },
      { label: "Finance Copilot (KI-Chat)", starter: false, professional: true, enterprise: true, kanzlei: true },
      { label: "Confidence-Score & Reasoning", starter: true, professional: true, enterprise: true, kanzlei: true },
    ],
  },
  {
    category: "E-Rechnung & Compliance",
    features: [
      { label: "KoSIT-Validierung (EN 16931)", starter: true, professional: true, enterprise: true, kanzlei: true },
      { label: "XRechnung 3.0 Generator", starter: true, professional: true, enterprise: true, kanzlei: true },
      { label: "ZUGFeRD 2.1 Generator", starter: true, professional: true, enterprise: true, kanzlei: true },
      { label: "GoBD-konformer Audit-Trail", starter: "Basis", professional: "Vollständig", enterprise: "Vollständig", kanzlei: "Vollständig" },
    ],
  },
  {
    category: "Export & Integration",
    features: [
      { label: "DATEV-CSV-Export (EXTF 700)", starter: true, professional: true, enterprise: true, kanzlei: true },
      { label: "API-Zugang", starter: false, professional: false, enterprise: true, kanzlei: true },
      { label: "Batch-DATEV-Export", starter: false, professional: "Basis", enterprise: true, kanzlei: true },
    ],
  },
];

const FAQ: [string, string][] = [
  ["Gibt es eine kostenlose Testphase?", "Ja — 14 Tage kostenlos, ohne Kreditkarte, ohne automatische Verlängerung. Kein Zahlungsmittel erforderlich."],
  ["Kann ich den Plan monatlich wechseln?", "Ja, Up- und Downgrades sind jederzeit zum nächsten Abrechnungszeitraum möglich."],
  ["Wo werden meine Daten gespeichert?", "Ausschließlich in deutschen Rechenzentren — DSGVO- und GoBD-konform. AVV nach Art. 28 unter /avv verfügbar."],
  ["Was bedeutet ‚DATEV-kompatibler Export'?", "FlowCheck AI+ exportiert einen DATEV-Buchungsstapel (EXTF 700 CSV) — direkt importierbar in DATEV Unternehmen online. Kein offizieller DATEV-API-Connector."],
  ["Was ist der Finance Copilot?", "Ein KI-Chat (Claude Sonnet 4) über Ihre eigenen Rechnungsdaten — Spend-Analysen, Lieferantenvergleiche und Budgetstatus in natürlicher Sprache. Ab Professional-Plan."],
  ["Wie unterscheidet sich das Kanzlei-Paket?", "Multi-Mandanten-Management, mandantentrennende Archivierung, Whitelabel-Option und Sammel-DATEV-Export für Steuerberatungskanzleien. Preis auf Anfrage."],
];

function MatrixCell({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value
      ? <Check className="mx-auto h-4 w-4 text-emerald-600" />
      : <span className="block text-center text-[#cbd5e1]">—</span>;
  }
  return <span className="block text-center text-xs font-medium text-[#64748b]">{value}</span>;
}

export default function PreisePage() {
  return (
    <PublicPage
      title="Preise"
      subtitle="Transparente Pläne ohne Setup-Kosten. 14 Tage kostenlos — ohne Kreditkarte."
    >
      {/* Vertrauenssignal */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-2xl bg-white px-6 py-4 shadow-sm ring-1 ring-stone-200/60">
        {[
          "✓ 14 Tage kostenlos — ohne Kreditkarte",
          "✓ Kündigung jederzeit möglich",
          "✓ Hosting in Deutschland",
          "✓ GoBD & DSGVO konform",
          "✓ SLA 99,5 % im Enterprise-Plan",
        ].map((t) => (
          <span key={t} className="text-xs font-medium text-[#003856]">{t}</span>
        ))}
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-4">
        {PLANS.map((p, i) => (
          <Reveal key={p.tier} delay={i * 80} className="h-full">
          <TiltCard
            max={4}
            className={`flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 transition-shadow hover:shadow-xl ${
              p.featured ? "ring-2 ring-[#003856]" : "ring-stone-200/60"
            }`}
          >
            {p.badge && (
              <span className={`mb-3 self-start rounded-md px-2 py-0.5 text-xs font-semibold text-white ${p.featured ? "bg-[#003856]" : "bg-[#c8985a]"}`}>
                {p.badge}
              </span>
            )}
            <h2 className="text-sm font-medium uppercase tracking-wide text-stone-400">{p.tier}</h2>
            <div className="mt-2">
              {p.price === "Auf Anfrage" ? (
                <p className="text-2xl font-semibold tracking-tight text-[#003856]">Auf Anfrage</p>
              ) : (
                <p className="text-3xl font-semibold tracking-tight text-[#003856]">
                  {p.price}
                  <span className="text-sm font-normal text-stone-400"> {p.sub}</span>
                </p>
              )}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-stone-500">{p.desc}</p>
            <ul className="mt-5 flex-1 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-stone-600">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  {f}
                </li>
              ))}
            </ul>
            {p.contact ? (
              <a
                href="mailto:ki@sbsdeutschland.de"
                className="mt-6 rounded-xl bg-stone-50 px-4 py-2.5 text-center text-sm font-medium text-[#003856] ring-1 ring-stone-200 transition hover:bg-stone-100"
              >
                Kontakt aufnehmen
              </a>
            ) : (
              <Link
                href="/register"
                className={`mt-6 rounded-xl px-4 py-2.5 text-center text-sm font-medium transition ${
                  p.featured
                    ? "bg-[#003856] text-white hover:bg-[#002a42]"
                    : "bg-stone-50 text-[#003856] ring-1 ring-stone-200 hover:bg-stone-100"
                }`}
              >
                14 Tage kostenlos
              </Link>
            )}
          </TiltCard>
          </Reveal>
        ))}
      </div>

      {/* Feature-Matrix */}
      <section className="mt-16">
        <Reveal>
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#003856]">Feature-Matrix</h2>
        </Reveal>
        <Reveal delay={80} className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/60">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-left">
                <th className="px-4 py-3 text-xs font-medium text-stone-400">Feature</th>
                {["Starter", "Professional", "Enterprise", "Kanzlei"].map((t) => (
                  <th key={t} className="px-4 py-3 text-center text-xs font-semibold text-[#003856]">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_MATRIX.map(({ category, features }) => (
                <>
                  <tr key={category} className="border-t border-stone-100 bg-stone-50">
                    <td colSpan={5} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#c8985a]">
                      {category}
                    </td>
                  </tr>
                  {features.map((f) => (
                    <tr key={f.label} className="border-t border-stone-50 hover:bg-stone-50/50">
                      <td className="px-4 py-2.5 text-xs text-stone-700">{f.label}</td>
                      <td className="px-4 py-2.5"><MatrixCell value={f.starter} /></td>
                      <td className="px-4 py-2.5"><MatrixCell value={f.professional} /></td>
                      <td className="px-4 py-2.5"><MatrixCell value={f.enterprise} /></td>
                      <td className="px-4 py-2.5"><MatrixCell value={f.kanzlei} /></td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </Reveal>
      </section>

      {/* FAQ */}
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

      {/* CTA */}
      <Reveal className="mt-12 rounded-2xl bg-[#003856] p-8 text-center">
        <h3 className="text-xl font-bold text-white">Fragen zu Enterprise oder Kanzlei-Paketen?</h3>
        <p className="mt-2 text-sm text-white/70">Wir beraten Sie persönlich — ohne Vertriebsdruck.</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <a
            href="mailto:ki@sbsdeutschland.de"
            className="inline-flex items-center gap-2 rounded-xl bg-[#FFB900] px-5 py-3 text-sm font-bold text-[#003856] transition hover:bg-[#e6a800]"
          >
            Demo anfragen <ArrowRight className="h-4 w-4" />
          </a>
          <Link
            href="/trust"
            className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-3 text-sm font-medium text-white transition hover:border-white/50"
          >
            Trust Center & AVV
          </Link>
        </div>
      </Reveal>
    </PublicPage>
  );
}
