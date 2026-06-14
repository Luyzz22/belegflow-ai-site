import Link from "next/link";
import {
  Upload,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  FileCheck,
  Lock,
  Server,
  ArrowRight,
  Zap,
  Target,
  Coins,
  Check,
  X,
  type LucideIcon,
} from "lucide-react";
import PublicNav from "@/components/PublicNav";
import Footer from "@/components/Footer";
import Faq from "@/components/landing/Faq";
import HeroMockup from "@/components/landing/HeroMockup";
import SocialProofBar from "@/components/landing/SocialProofBar";

const VALUE_PROPS: { icon: LucideIcon; stat: string; title: string; desc: string; cta?: { label: string; href: string } }[] = [
  {
    icon: Zap,
    stat: "85% schneller",
    title: "Von 8 Minuten auf 45 Sekunden",
    desc: "Pro Rechnung. Ihr Team gewinnt Zeit für die wirklich wichtigen Aufgaben.",
  },
  {
    icon: Target,
    stat: "99,7% Genauigkeit",
    title: "KI-Extraktion mit Validierung",
    desc: "§14-Prüfung, IBAN-Check und Duplikaterkennung. Weniger Fehler, weniger Nacharbeit.",
  },
  {
    icon: Coins,
    stat: "5.700 € / Jahr",
    title: "Ersparnis bei 100 Rechnungen/Monat",
    desc: "Berechnen Sie Ihren konkreten ROI in unter einer Minute.",
    cta: { label: "Jetzt berechnen", href: "/roi" },
  },
];

const STEPS: { num: string; icon: LucideIcon; title: string; desc: string }[] = [
  { num: "1", icon: Upload, title: "Rechnung hochladen", desc: "PDF, Scan oder E-Rechnung — einzeln oder im Stapel." },
  { num: "2", icon: Sparkles, title: "KI prüft in Sekunden", desc: "Felder extrahieren, §14 validieren, kontieren." },
  { num: "3", icon: CheckCircle2, title: "Freigeben & Exportieren", desc: "Mehrstufig genehmigen und DATEV-ready exportieren." },
];

const COMPARE: { label: string; manuell: string | boolean; flow: string | boolean }[] = [
  { label: "Bearbeitungszeit", manuell: "8 Min", flow: "45 Sek" },
  { label: "Fehlerquote", manuell: "4 %", flow: "0,3 %" },
  { label: "DATEV-Export", manuell: "Copy-Paste", flow: "1 Klick" },
  { label: "§14-Prüfung", manuell: "Manuell", flow: "Automatisch" },
  { label: "Duplikaterkennung", manuell: false, flow: true },
  { label: "24/7 verfügbar", manuell: false, flow: true },
];

const PRICING: { tier: string; price: string; features: string[]; cta: string; href: string; featured: boolean }[] = [
  {
    tier: "Starter",
    price: "€99",
    features: ["100 Rechnungen/Monat", "KI-Extraktion + §14-Prüfung", "DATEV CSV-Export", "1 Benutzer"],
    cta: "Kostenlos testen",
    href: "/register",
    featured: false,
  },
  {
    tier: "Professional",
    price: "€349",
    features: ["500 Rechnungen/Monat", "Alles aus Starter, plus:", "3-Wege-Match", "Anomalie-Erkennung", "Review-Modus", "5 Benutzer"],
    cta: "Kostenlos testen",
    href: "/register",
    featured: true,
  },
  {
    tier: "Enterprise",
    price: "€999",
    features: ["Unbegrenzte Rechnungen", "Alles aus Professional, plus:", "SSO / SAML", "API-Zugang", "Dedizierter Support", "SLA 99,9 %"],
    cta: "Kontakt aufnehmen",
    href: "/kontakt",
    featured: false,
  },
];

const TRUST_CARDS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: ShieldCheck, title: "DSGVO-konform", desc: "AVV inklusive, Verarbeitung nach EU-Recht." },
  { icon: FileCheck, title: "GoBD-ready", desc: "Revisionssichere, unveränderbare Ablage." },
  { icon: Lock, title: "TLS-verschlüsselt", desc: "256-Bit-Verschlüsselung für alle Daten." },
  { icon: Server, title: "Hosting in Deutschland", desc: "Ausschließlich deutsche Rechenzentren." },
];

function CompareCell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="mx-auto h-5 w-5 text-emerald-600" />
    ) : (
      <X className="mx-auto h-5 w-5 text-[#cbd5e1]" />
    );
  }
  return <>{value}</>;
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <PublicNav />

      {/* Hero */}
      <section className="fc-grid-accent relative overflow-hidden border-b border-[rgba(0,56,86,0.08)]">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[60%_40%]">
          <div>
            <p className="fc-fade-in text-xs font-semibold uppercase tracking-wider text-[#c8985a]">
              KI-native Rechnungsverarbeitung
            </p>
            <h1 className="fc-rise mt-5 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-[#1a1a2e] sm:text-5xl lg:text-6xl">
              Rechnungen in Sekunden
              <br />
              statt in Minuten.
            </h1>
            <p className="fc-rise mt-6 max-w-xl text-base text-[#64748b] sm:text-lg">
              FlowCheck AI+ prüft, validiert und kontiert Ihre Eingangsrechnungen automatisch. DATEV-ready.
              DSGVO-konform. Hosting Deutschland.
            </p>
            <div className="fc-rise mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-[#FFB900] px-8 py-4 text-lg font-bold text-[#003856] transition-all hover:bg-[#e6a800] active:scale-95"
              >
                Kostenlos testen
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/login" className="font-medium text-[#003856] underline underline-offset-4 hover:text-[#002a42]">
                Live-Demo ansehen →
              </Link>
            </div>
            <p className="fc-fade-in mt-5 text-sm text-[#64748b]">
              Keine Kreditkarte · 14 Tage kostenlos · DSGVO-konform
            </p>
          </div>

          <div className="fc-rise flex justify-center lg:justify-end">
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <SocialProofBar />

      {/* Warum FlowCheck — Ergebnisse */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#c8985a]">Warum FlowCheck?</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1a1a2e]">Ergebnisse, keine Versprechen</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {VALUE_PROPS.map(({ icon: Icon, stat, title, desc, cta }) => (
            <div key={stat} className="rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-7 shadow-[0_1px_3px_rgba(0,56,86,0.06)] transition-all hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#003856]/5 text-[#003856]">
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-2xl font-bold text-[#003856]">{stat}</p>
              <h3 className="mt-2 font-semibold text-[#1a1a2e]">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#64748b]">{desc}</p>
              {cta && (
                <Link href={cta.href} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#003856] hover:gap-1.5">
                  {cta.label} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* So funktioniert es */}
      <section className="border-y border-[rgba(0,56,86,0.08)] bg-[#faf9f7] py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#c8985a]">Ablauf</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1a1a2e]">In drei Schritten zur Automatisierung</h2>
          <div className="relative mt-14 grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="absolute left-1/2 top-6 hidden h-px w-2/3 -translate-x-1/2 bg-[rgba(0,56,86,0.12)] md:block" aria-hidden />
            {STEPS.map(({ num, icon: Icon, title, desc }, i) => (
              <div key={num} className="fc-rise group relative flex flex-col items-center" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#003856] text-lg font-bold text-white ring-8 ring-[#faf9f7] transition-transform group-hover:scale-105">
                  {num}
                </div>
                <div className="mt-5 flex items-center gap-2 font-semibold text-[#1a1a2e]">
                  <Icon className="h-5 w-5 text-[#c8985a]" />
                  {title}
                </div>
                <p className="mt-1.5 max-w-xs text-sm text-[#64748b]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vergleich */}
      <section className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#c8985a]">Vergleich</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1a1a2e]">FlowCheck vs. manuelle Bearbeitung</h2>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,56,86,0.08)] text-left">
                <th className="px-5 py-4" />
                <th className="px-5 py-4 text-center font-medium text-[#64748b]">Manuell</th>
                <th className="px-5 py-4 text-center font-semibold text-[#003856]">FlowCheck AI+</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,56,86,0.06)]">
              {COMPARE.map((row) => (
                <tr key={row.label}>
                  <td className="px-5 py-3.5 font-medium text-[#1a1a2e]">{row.label}</td>
                  <td className="px-5 py-3.5 text-center text-[#64748b]">
                    <CompareCell value={row.manuell} />
                  </td>
                  <td className="px-5 py-3.5 text-center font-semibold text-emerald-700">
                    <CompareCell value={row.flow} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-y border-[rgba(0,56,86,0.08)] bg-[#faf9f7] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#c8985a]">Preise</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1a1a2e]">Transparent. Planbar. Ohne Setup-Kosten.</h2>
          </div>
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            {PRICING.map(({ tier, price, features, cta, href, featured }) => (
              <div
                key={tier}
                className={`relative flex flex-col rounded-2xl bg-white p-7 transition-all ${
                  featured ? "shadow-md ring-2 ring-[#003856]" : "border border-[rgba(0,56,86,0.08)] shadow-[0_1px_3px_rgba(0,56,86,0.06)] hover:shadow-md"
                }`}
              >
                {featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#003856] px-3 py-1 text-xs font-semibold text-white">
                    EMPFOHLEN
                  </span>
                )}
                <p className="text-xs font-semibold uppercase tracking-wider text-[#c8985a]">{tier}</p>
                <p className="mt-3 text-3xl font-bold text-[#1a1a2e]">
                  {price}
                  <span className="text-base font-normal text-[#64748b]"> /Monat</span>
                </p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#64748b]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={href}
                  className={`mt-7 rounded-xl px-6 py-3 text-center font-semibold transition-all active:scale-95 ${
                    featured ? "bg-[#FFB900] text-[#003856] hover:bg-[#e6a800]" : "border border-[#003856]/20 text-[#003856] hover:bg-[#003856]/5"
                  }`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#c8985a]">Vertrauen &amp; Sicherheit</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1a1a2e]">Entwickelt für deutsche Compliance-Anforderungen</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_CARDS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)] transition-all hover:shadow-md">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#003856]/5 text-[#003856]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-[#1a1a2e]">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#64748b]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[rgba(0,56,86,0.08)] bg-[#faf9f7] px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#c8985a]">FAQ</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1a1a2e]">Häufige Fragen</h2>
          </div>
          <Faq />
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#003856]">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:py-20">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white">
            Bereit, Ihre Rechnungsverarbeitung zu automatisieren?
          </h2>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#FFB900] px-7 py-4 text-lg font-bold text-[#003856] transition-all hover:bg-[#e6a800] active:scale-95"
          >
            Jetzt kostenlos starten — in 2 Minuten eingerichtet
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mx-auto mt-5 max-w-xl text-sm text-white/70">
            Oder vereinbaren Sie eine persönliche Demo:{" "}
            <a href="mailto:ki@sbsdeutschland.de" className="font-medium text-[#ffb900] hover:underline">
              ki@sbsdeutschland.de
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
