import Link from "next/link";
import {
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
  Brain,
  MessageSquare,
  BarChart3,
  Copy,
  AlertCircle,
  BookOpen,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import PublicNav from "@/components/PublicNav";
import Footer from "@/components/Footer";
import Faq from "@/components/landing/Faq";
import SocialProofBar from "@/components/landing/SocialProofBar";
import Testimonials from "@/components/landing/Testimonials";
import InteractiveHero from "@/components/landing/InteractiveHero";
import ProductFilm from "@/components/landing/ProductFilm";
import Integrations from "@/components/landing/Integrations";
import HowItWorks from "@/components/landing/HowItWorks";
import Reveal from "@/components/landing/Reveal";
import TiltCard from "@/components/landing/TiltCard";

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
    title: "KI-Extraktion mit Confidence-Score",
    desc: "Gemini 2.5 Flash + Claude Sonnet 4 — mit erklärbarem Reasoning und SKR03/04 Kontierungsvorschlag.",
  },
  {
    icon: Coins,
    stat: "5.700 € / Jahr",
    title: "Ersparnis bei 100 Rechnungen/Monat",
    desc: "Berechnen Sie Ihren konkreten ROI in unter einer Minute.",
    cta: { label: "Jetzt berechnen", href: "/roi" },
  },
];

const KI_FEATURES: { icon: LucideIcon; label: string; title: string; desc: string; badge?: string }[] = [
  {
    icon: Brain,
    label: "KI-Kontierung",
    title: "SKR03/04 mit Reasoning",
    desc: "Gemini 2.5 Flash schlägt Konto, Gegenkonto, Steuerschlüssel und Buchungstext vor — mit Confidence-Score und erklärbarer Begründung. Kein anderer SME-Anbieter bietet dies in dieser Qualität.",
    badge: "Kernfeature",
  },
  {
    icon: MessageSquare,
    label: "Finance Copilot",
    title: "KI-Chat über Ihre Rechnungen",
    desc: "Stellen Sie dem System Fragen zu Ihren eigenen Rechnungsdaten — powered by Claude Sonnet 4. Spend-Analysen, Lieferantenvergleiche und Budgetstatus in natürlicher Sprache.",
    badge: "Einzigartig",
  },
  {
    icon: FileCheck,
    label: "KoSIT-Validierung",
    title: "EN 16931 · XRechnung 3.0 · ZUGFeRD 2.1",
    desc: "Integrierter KoSIT-Validator prüft XRechnungen auf EN-16931-Konformität. Ergebnis: Valid: true, Errors: 0. Sofortige Compliance für die E-Rechnungspflicht ab 2025.",
    badge: "EN 16931",
  },
  {
    icon: Copy,
    label: "Duplikaterkennung",
    title: "SHA-256 + Fuzzy-Matching",
    desc: "Doppelte Rechnungen werden per SHA-256-Hash und Fuzzy-Matching (Lieferant, Betrag, Datum, Rechnungsnummer) mit 95% Confidence erkannt — bevor sie die Buchhaltung erreichen.",
  },
  {
    icon: AlertCircle,
    label: "Anomalie-Detection",
    title: "Eigenständiger Detection-Service",
    desc: "Abweichungen von Lieferantenmustern, ungewöhnliche Beträge und regelbasierte Anomalien werden automatisch erkannt und zur Prüfung markiert.",
  },
  {
    icon: BarChart3,
    label: "Budget Tracking",
    title: "8 vordefinierte SKR-Kategorien",
    desc: "Wareneingang (3400), Raumkosten (4200), EDV/Software (4964) u.v.m. mit Jahresplanungsfunktion und Spend Analytics via Recharts-Visualisierungen.",
  },
];

const COMPARE: { label: string; manuell: string | boolean; candis: string | boolean; flow: string | boolean }[] = [
  { label: "Bearbeitungszeit", manuell: "8 Min", candis: "2–3 Min", flow: "45 Sek" },
  { label: "KI-Kontierung SKR03/04", manuell: false, candis: "Vorkontierung", flow: "Reasoning + Score" },
  { label: "Finance Copilot (KI-Chat)", manuell: false, candis: false, flow: true },
  { label: "XRechnung 3.0 Generator", manuell: false, candis: false, flow: true },
  { label: "KoSIT-Validierung EN 16931", manuell: false, candis: false, flow: true },
  { label: "Budget Tracking (SKR)", manuell: false, candis: false, flow: true },
  { label: "DATEV-kompatibler Export", manuell: "Copy-Paste", candis: "Direkt-API", flow: "1 Klick CSV" },
  { label: "Duplikaterkennung", manuell: false, candis: "Basis", flow: "SHA-256 + Fuzzy" },
  { label: "Preis ab / Monat", manuell: "—", candis: "€ 369", flow: "€ 99" },
];

const PRICING: { tier: string; price: string; features: string[]; cta: string; href: string; featured: boolean }[] = [
  {
    tier: "Starter",
    price: "€99",
    features: [
      "100 Rechnungen/Monat",
      "KI-Extraktion + §14-Prüfung",
      "SKR03/04 Kontierungsvorschlag",
      "DATEV-kompatibler CSV-Export",
      "KoSIT-Validierung",
      "1 Benutzer",
    ],
    cta: "14 Tage kostenlos — ohne Kreditkarte",
    href: "/register",
    featured: false,
  },
  {
    tier: "Professional",
    price: "€349",
    features: [
      "500 Rechnungen/Monat",
      "Alles aus Starter, plus:",
      "Finance Copilot (KI-Chat)",
      "Budget Tracking (SKR-Kategorien)",
      "3-Wege-Match",
      "Anomalie-Erkennung",
      "Review-Modus",
      "5 Benutzer",
    ],
    cta: "14 Tage kostenlos — ohne Kreditkarte",
    href: "/register",
    featured: true,
  },
  {
    tier: "Enterprise",
    price: "€999",
    features: [
      "Unbegrenzte Rechnungen",
      "Alles aus Professional, plus:",
      "SSO / SAML",
      "API-Zugang",
      "Vollständiger Audit-Trail",
      "Dedizierter Support",
      "SLA 99,5 %",
    ],
    cta: "Kontakt aufnehmen",
    href: "/kontakt",
    featured: false,
  },
];

const TRUST_CARDS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: ShieldCheck, title: "DSGVO-konform", desc: "AVV nach Art. 28 inklusive — als Download unter /avv verfügbar." },
  { icon: FileCheck, title: "GoBD 2025 konform", desc: "Revisionssichere Ablage mit vollständigem Audit-Trail bei jedem Verarbeitungsschritt." },
  { icon: Lock, title: "TLS 1.3 + AES-256", desc: "Transportverschlüsselung und AES-256 im Ruhezustand für alle Rechnungsdaten." },
  { icon: MapPin, title: "🇩🇪 Hosting in Deutschland", desc: "Ausschließlich deutsche Rechenzentren. Gerichtsstand Heidelberg, deutsches SaaS-Recht." },
  { icon: BookOpen, title: "KI: Mensch entscheidet", desc: "EU AI Act ready — KI schlägt vor, Mensch genehmigt. Kein Automatismus ohne Bestätigung." },
  { icon: Server, title: "SLA 99,5 %", desc: "Vertraglich vereinbart im Enterprise-Plan. Sentry-Monitoring aktiv." },
];

type CellValue = string | boolean;

function CompareCell({ value, highlight = false }: { value: CellValue; highlight?: boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className={`mx-auto h-5 w-5 ${highlight ? "text-emerald-600" : "text-emerald-500"}`} />
    ) : (
      <X className="mx-auto h-5 w-5 text-[#cbd5e1]" />
    );
  }
  return <span className={highlight ? "font-semibold text-emerald-700" : ""}>{value}</span>;
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <PublicNav />

      {/* Hero — drei interaktive Produkt-Szenen */}
      <InteractiveHero />

      {/* Produktfilm */}
      <ProductFilm />

      {/* Integrationen */}
      <Integrations />

      {/* Social Proof */}
      <SocialProofBar />

      {/* Warum FlowCheck — Ergebnisse */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <Reveal className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#c8985a]">Warum FlowCheck?</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1a1a2e]">Ergebnisse, keine Versprechen</h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {VALUE_PROPS.map(({ icon: Icon, stat, title, desc, cta }, i) => (
            <Reveal key={stat} delay={i * 100}>
              <TiltCard max={6} className="h-full rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-7 shadow-[0_1px_3px_rgba(0,56,86,0.06)] transition-shadow hover:shadow-xl">
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
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* KI-Tiefe — echte Differenzierung */}
      <section className="border-y border-[rgba(0,56,86,0.08)] bg-[#003856] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-4 text-center">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#FFB900]">
              Echte KI-Kontierung — nicht nur OCR
            </span>
          </Reveal>
          <Reveal className="mb-14 text-center">
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Gemini 2.5 Flash + Claude Sonnet 4<br className="hidden sm:block" />
              kontieren nach SKR03 oder SKR04
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-white/65">
              Mit Confidence-Score und erklärbarem Reasoning — automatisch, nachvollziehbar, korrigierbar.
              Kein Mittelstands-Anbieter bietet dieses Qualitätsniveau.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {KI_FEATURES.map(({ icon: Icon, label, title, desc, badge }, i) => (
              <Reveal key={label} delay={i * 80}>
                <div className="relative h-full rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 transition-all hover:bg-white/8 hover:ring-white/20">
                  {badge && (
                    <span className="mb-3 inline-block rounded-md bg-[#FFB900]/20 px-2 py-0.5 text-xs font-semibold text-[#FFB900]">
                      {badge}
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#c8985a]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">{label}</p>
                      <h3 className="text-sm font-semibold text-white">{title}</h3>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 text-center">
            <Link
              href="/e-rechnung-pruefen"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-all hover:border-[#FFB900] hover:text-[#FFB900]"
            >
              E-Rechnung kostenlos prüfen <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Social Proof — Testimonials */}
      <Testimonials />

      {/* So funktioniert es — Scrollytelling */}
      <HowItWorks />

      {/* Wettbewerbsvergleich */}
      <section className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
        <Reveal className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#c8985a]">Marktvergleich</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1a1a2e]">FlowCheck AI+ vs. Candis vs. manuell</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[#64748b]">
            Candis ist ab €&nbsp;369/Monat positioniert — wir bieten mehr KI-Tiefe ab €&nbsp;99.
          </p>
        </Reveal>
        <Reveal delay={120} className="overflow-x-auto rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,56,86,0.08)] text-left">
                <th className="px-5 py-4 text-[#64748b]">Feature</th>
                <th className="px-5 py-4 text-center font-medium text-[#64748b]">Manuell</th>
                <th className="px-5 py-4 text-center font-medium text-[#64748b]">Candis</th>
                <th className="px-5 py-4 text-center font-semibold text-[#003856]">FlowCheck AI+</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,56,86,0.06)]">
              {COMPARE.map((row) => (
                <tr key={row.label} className="hover:bg-[#f8f6f3]/50">
                  <td className="px-5 py-3.5 font-medium text-[#1a1a2e]">{row.label}</td>
                  <td className="px-5 py-3.5 text-center text-[#64748b]">
                    <CompareCell value={row.manuell} />
                  </td>
                  <td className="px-5 py-3.5 text-center text-[#64748b]">
                    <CompareCell value={row.candis} />
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <CompareCell value={row.flow} highlight />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
        <p className="mt-4 text-center text-xs text-[#94a3b8]">
          Candis-Preis: ab €&nbsp;369/Monat (Quelle: Candis Website, März 2026). Kein offizieller DATEV-API-Connector bei FlowCheck AI+ — DATEV-kompatibler CSV-Export (EXTF 700).
        </p>
      </section>

      {/* Pricing */}
      <section className="border-y border-[rgba(0,56,86,0.08)] bg-[#faf9f7] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#c8985a]">Preise</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1a1a2e]">Transparent. Planbar. Ohne Setup-Kosten.</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-[#64748b]">14 Tage kostenlos testen — ohne Kreditkarte, ohne Vertragsbindung.</p>
          </Reveal>
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            {PRICING.map(({ tier, price, features, cta, href, featured }, i) => (
              <Reveal
                key={tier}
                delay={i * 100}
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
                  className={`mt-7 rounded-xl px-6 py-3 text-center text-sm font-semibold transition-all active:scale-95 ${
                    featured ? "bg-[#FFB900] text-[#003856] hover:bg-[#e6a800]" : "border border-[#003856]/20 text-[#003856] hover:bg-[#003856]/5"
                  }`}
                >
                  {cta}
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8 text-center">
            <Link href="/preise" className="inline-flex items-center gap-1 text-sm font-medium text-[#003856] hover:gap-1.5 hover:underline">
              Alle Pläne vergleichen inkl. Kanzlei-Paket <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <Reveal className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#c8985a]">Vertrauen &amp; Sicherheit</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1a1a2e]">Entwickelt für deutsche Compliance-Anforderungen</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[#64748b]">
            Hosting in Deutschland · GoBD 2025 · DSGVO Art. 28 · EU AI Act ready
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST_CARDS.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 80}>
              <TiltCard max={6} className="h-full rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)] transition-shadow hover:shadow-xl">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#003856]/5 text-[#003856]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-[#1a1a2e]">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#64748b]">{desc}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/trust" className="inline-flex items-center gap-1 text-sm font-medium text-[#003856] hover:underline">
            Trust Center <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="text-[#cbd5e1]">·</span>
          <Link href="/avv" className="inline-flex items-center gap-1 text-sm font-medium text-[#003856] hover:underline">
            AVV (DSGVO Art. 28) <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="text-[#cbd5e1]">·</span>
          <Link href="/compliance" className="inline-flex items-center gap-1 text-sm font-medium text-[#003856] hover:underline">
            Compliance-Übersicht <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
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
          <p className="text-xs font-semibold uppercase tracking-wider text-[#c8985a]">Jetzt starten</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight text-white">
            Die KI-native Rechnungsverarbeitung<br className="hidden sm:block" />
            für den deutschen Mittelstand
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/70">
            Von der E-Rechnung bis zum DATEV-Export, alles in einem System — ab dem ersten Tag GoBD-konform.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#FFB900] px-7 py-4 text-lg font-bold text-[#003856] transition-all hover:bg-[#e6a800] active:scale-95"
          >
            14 Tage kostenlos — ohne Kreditkarte
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
