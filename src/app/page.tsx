import Link from "next/link";
import {
  ScanText,
  CheckCircle2,
  GitCompareArrows,
  Landmark,
  ScanSearch,
  Workflow,
  Upload,
  Sparkles,
  ShieldCheck,
  FileCheck,
  MapPin,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import PublicNav from "@/components/PublicNav";
import Footer from "@/components/Footer";

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: ScanText,
    title: "KI-Extraktion",
    desc: "Felder automatisch aus PDF, Scan und E-Rechnung erkennen.",
  },
  {
    icon: CheckCircle2,
    title: "§14 UStG Prüfung",
    desc: "Pflichtangaben, IBAN, USt-ID automatisch validieren.",
  },
  {
    icon: GitCompareArrows,
    title: "3-Wege-Match",
    desc: "Rechnung gegen Bestellung und Vertrag abgleichen.",
  },
  {
    icon: Landmark,
    title: "DATEV-Export",
    desc: "Buchungssätze sofort DATEV-ready exportieren.",
  },
  {
    icon: ScanSearch,
    title: "Anomalie-Erkennung",
    desc: "Statistische Ausreißer und Duplikate erkennen.",
  },
  {
    icon: Workflow,
    title: "Mehrstufige Freigabe",
    desc: "Betragsgrenzen und Rollen konfigurierbar.",
  },
];

const STEPS: { num: string; icon: LucideIcon; title: string; desc: string }[] = [
  {
    num: "1",
    icon: Upload,
    title: "Rechnungen hochladen",
    desc: "PDF, Scan, E-Mail oder E-Rechnung — einzeln oder im Stapel.",
  },
  {
    num: "2",
    icon: Sparkles,
    title: "KI prüft automatisch",
    desc: "Felder extrahieren, §14 validieren, Anomalien erkennen.",
  },
  {
    num: "3",
    icon: CheckCircle2,
    title: "Freigeben & Exportieren",
    desc: "Mehrstufig genehmigen und DATEV-ready exportieren.",
  },
];

const PRICING: {
  tier: string;
  price: string;
  feature: string;
  featured: boolean;
}[] = [
  {
    tier: "Starter",
    price: "€99",
    feature: "100 Rechnungen, Basis-Prüfung",
    featured: false,
  },
  {
    tier: "Professional",
    price: "€349",
    feature: "500 Rechnungen, 3-Wege-Match, DATEV",
    featured: true,
  },
  {
    tier: "Business",
    price: "€999",
    feature: "2.000 Rechnungen, Anomalie, SSO, API",
    featured: false,
  },
];

const TRUST: { icon: LucideIcon; label: string }[] = [
  { icon: MapPin, label: "Hosting Deutschland" },
  { icon: ShieldCheck, label: "DSGVO-konform" },
  { icon: FileCheck, label: "GoBD-ready" },
  { icon: Landmark, label: "DATEV-Export" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <PublicNav />

      {/* Hero */}
      <section className="fc-grid-accent relative overflow-hidden border-b border-[rgba(0,56,86,0.08)]">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center sm:py-28">
          <p className="fc-fade-in text-xs font-semibold uppercase tracking-wider text-[#c8985a]">
            KI-native Rechnungsverarbeitung
          </p>
          <h1 className="fc-rise mx-auto mt-5 max-w-4xl text-balance text-4xl font-bold tracking-tight text-[#1a1a2e] sm:text-5xl">
            Eingangsrechnungen intelligent prüfen, freigeben und exportieren.
          </h1>
          <p className="fc-rise mx-auto mt-6 max-w-2xl text-base text-[#64748b] sm:text-lg">
            FlowCheck AI+ erkennt Fehler, Duplikate und Anomalien — bevor sie in
            Ihre Buchhaltung gelangen.
          </p>
          <div className="fc-rise mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FFB900] px-6 py-3 font-semibold text-[#003856] transition-all hover:bg-[#e6a800]"
            >
              Kostenlos testen
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="rounded-xl px-6 py-3 font-medium text-[#003856] transition-all hover:bg-[#003856]/5"
            >
              Demo ansehen
            </Link>
          </div>
          <div className="fc-fade-in mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-[#64748b]">
            {TRUST.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2">
                <Icon className="h-4 w-4 text-[#c8985a]" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#c8985a]">
            Funktionen
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1a1a2e]">
            Alles für die automatisierte Kreditorenbuchhaltung
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)] transition-all hover:shadow-md"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#003856]/5 text-[#003856]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-[#1a1a2e]">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#64748b]">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-[rgba(0,56,86,0.08)] bg-[#faf9f7] py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#c8985a]">
            Ablauf
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1a1a2e]">
            In drei Schritten zur Automatisierung
          </h2>
          <div className="relative mt-14 grid grid-cols-1 gap-10 md:grid-cols-3">
            {/* connecting line */}
            <div
              className="absolute left-1/2 top-6 hidden h-px w-2/3 -translate-x-1/2 bg-[rgba(0,56,86,0.12)] md:block"
              aria-hidden
            />
            {STEPS.map(({ num, icon: Icon, title, desc }) => (
              <div key={num} className="relative flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#003856] text-lg font-bold text-white ring-8 ring-[#faf9f7]">
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

      {/* Pricing preview */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#c8985a]">
            Preise
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1a1a2e]">
            Transparent. Planbar. Ohne Setup-Kosten.
          </h2>
        </div>
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {PRICING.map(({ tier, price, feature, featured }) => (
            <div
              key={tier}
              className={`relative flex flex-col rounded-2xl bg-white p-7 transition-all ${
                featured
                  ? "border border-transparent shadow-md ring-2 ring-[#003856]"
                  : "border border-[rgba(0,56,86,0.08)] shadow-[0_1px_3px_rgba(0,56,86,0.06)] hover:shadow-md"
              }`}
            >
              {featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#003856] px-3 py-1 text-xs font-semibold text-white">
                  EMPFOHLEN
                </span>
              )}
              <p className="text-xs font-semibold uppercase tracking-wider text-[#c8985a]">
                {tier}
              </p>
              <p className="mt-3 text-3xl font-bold text-[#1a1a2e]">
                {price}
                <span className="text-base font-normal text-[#64748b]">
                  {" "}
                  /Monat
                </span>
              </p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-[#64748b]">
                {feature}
              </p>
              <Link
                href="/register"
                className={`mt-7 rounded-xl px-6 py-3 text-center font-semibold transition-all ${
                  featured
                    ? "bg-[#FFB900] text-[#003856] hover:bg-[#e6a800]"
                    : "border border-[#003856]/20 text-[#003856] hover:bg-[#003856]/5"
                }`}
              >
                Kostenlos testen
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-[#64748b]">
          <Link
            href="/preise"
            className="inline-flex items-center gap-1 font-medium text-[#003856] hover:underline"
          >
            Alle Details ansehen
            <ArrowRight className="h-4 w-4" />
          </Link>
        </p>
      </section>

      {/* Final CTA band */}
      <section className="bg-[#003856]">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:py-20">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white">
            Bereit für automatisierte Rechnungsprüfung?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/70">
            Starten Sie in wenigen Minuten — 30 Tage kostenlos, keine
            Kreditkarte erforderlich.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#FFB900] px-6 py-3 font-semibold text-[#003856] transition-all hover:bg-[#e6a800]"
          >
            Kostenlos testen
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
