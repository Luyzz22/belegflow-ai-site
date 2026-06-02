import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import Footer from "@/components/Footer";

const FEATURES: { icon: string; title: string; desc: string }[] = [
  { icon: "🤖", title: "KI-Extraktion", desc: "Lieferant, Beträge, Steuersätze und IBAN werden automatisch aus jedem Beleg erkannt." },
  { icon: "📋", title: "§14 UStG Prüfung", desc: "Alle Pflichtangaben werden automatisch validiert — bevor gebucht wird." },
  { icon: "🔗", title: "3-Wege-Match", desc: "Rechnung, Bestellung und Vertrag werden automatisch abgeglichen." },
  { icon: "📦", title: "DATEV-Export", desc: "Buchungssätze SKR03/04 sofort exportbereit — kein manuelles Tippen." },
  { icon: "⚠️", title: "Anomalie-Detection", desc: "Ausreißer, Duplikate und auffällige Beträge werden erkannt und markiert." },
  { icon: "✅", title: "Mehrstufige Freigabe", desc: "Betragsgrenzen und Freigabestufen flexibel konfigurierbar." },
];

const STEPS: [string, string, string][] = [
  ["1", "Hochladen", "PDF, E-Mail oder XRechnung"],
  ["2", "KI analysiert", "Felder in Sekunden extrahiert & geprüft"],
  ["3", "Freigeben", "Prüfen und mehrstufig genehmigen"],
  ["4", "Exportieren", "DATEV-Buchungssätze sofort bereit"],
];

const PRICING = [
  { tier: "Starter", price: "€99", sub: "pro Monat", features: ["Bis 250 Rechnungen/Monat", "KI-Extraktion & §14 Prüfung", "DATEV-CSV-Export", "1 Benutzer"], featured: false },
  { tier: "Professional", price: "€349", sub: "pro Monat", features: ["Bis 1.500 Rechnungen/Monat", "Mehrstufige Freigaben", "Anomalie-Detection", "Lieferanten-Risiko-Score", "5 Benutzer"], featured: true },
  { tier: "Business", price: "€999", sub: "pro Monat", features: ["Unbegrenzte Rechnungen", "3-Wege-Match", "Audit-Trail & Compliance", "SSO / SAML", "Unbegrenzte Benutzer"], featured: false },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f4f7fa]">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white to-[#f4f7fa]" />
        <div className="mx-auto max-w-5xl px-6 py-24 text-center sm:py-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#003856]/5 px-4 py-1.5 text-sm font-medium text-[#003856] ring-1 ring-[#003856]/10">
            <span className="h-2 w-2 rounded-full bg-[#c8985a]" /> KI-native Rechnungsverarbeitung
          </div>
          <h1 className="mx-auto max-w-4xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-[#003856] sm:text-5xl lg:text-6xl">
            Eingangsrechnungen automatisch prüfen, freigeben und DATEV-bereit machen.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-600">
            KI-native Rechnungsverarbeitung für den deutschen Mittelstand. Von der E-Rechnung bis zum DATEV-Export.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="rounded-xl bg-[#003856] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#002a42]"
            >
              Kostenlos testen
            </Link>
            <Link
              href="/kontakt"
              className="rounded-xl bg-white px-6 py-3 text-sm font-medium text-[#003856] ring-1 ring-stone-200 transition hover:bg-stone-50"
            >
              Demo ansehen
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-stone-500">
            <span>🇩🇪 Hosting Deutschland</span>
            <span>🔒 DSGVO-konform</span>
            <span>📋 GoBD-ready</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#c8985a]">Funktionen</p>
          <h2 className="text-3xl font-semibold tracking-tight text-[#003856]">
            Alles für die automatisierte Kreditorenbuchhaltung
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/60 transition hover:shadow-md"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#003856]/5 text-xl">
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-stone-800">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#c8985a]">Ablauf</p>
          <h2 className="mb-14 text-3xl font-semibold tracking-tight text-[#003856]">
            In vier Schritten zur Automatisierung
          </h2>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STEPS.map(([n, t, d]) => (
              <div key={n} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#003856] text-lg font-semibold text-white">
                  {n}
                </div>
                <h3 className="text-base font-semibold text-stone-800">{t}</h3>
                <p className="mt-1 text-sm text-stone-500">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid grid-cols-2 gap-6 rounded-3xl bg-[#003856] p-10 text-center text-white sm:grid-cols-4">
          {[
            ["3 Sek.", "Pro Rechnung"],
            ["99 %", "Extraktions-Genauigkeit"],
            ["80 %", "Weniger manueller Aufwand"],
            ["100 %", "GoBD-konform"],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="text-3xl font-semibold tracking-tight text-[#c8985a]">{v}</p>
              <p className="mt-1 text-sm text-white/70">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#c8985a]">Preise</p>
          <h2 className="text-3xl font-semibold tracking-tight text-[#003856]">Transparent. Planbar. Ohne Setup-Kosten.</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PRICING.map((p) => (
            <div
              key={p.tier}
              className={`flex flex-col rounded-2xl bg-white p-7 shadow-sm ring-1 ${
                p.featured ? "ring-2 ring-[#003856]" : "ring-stone-200/60"
              }`}
            >
              {p.featured && (
                <span className="mb-3 self-start rounded-md bg-[#c8985a] px-2 py-0.5 text-xs font-semibold text-white">
                  Empfohlen
                </span>
              )}
              <p className="text-sm font-medium uppercase tracking-wide text-stone-400">{p.tier}</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-[#003856]">
                {p.price}
                <span className="text-base font-normal text-stone-400"> {p.sub}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-stone-600">
                    <span className="mt-0.5 font-semibold text-emerald-600">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`mt-7 rounded-xl px-4 py-2.5 text-center text-sm font-medium transition ${
                  p.featured
                    ? "bg-[#003856] text-white hover:bg-[#002a42]"
                    : "bg-stone-50 text-[#003856] ring-1 ring-stone-200 hover:bg-stone-100"
                }`}
              >
                Kostenlos testen
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-stone-500">
          Alle Pläne im Detail auf der{" "}
          <Link href="/preise" className="font-medium text-[#003856] hover:underline">
            Preisübersicht
          </Link>
          .
        </p>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-br from-[#003856] to-[#002a42] px-8 py-14 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white">Bereit für automatisierte Rechnungen?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Starten Sie in wenigen Minuten — 30 Tage kostenlos, keine Kreditkarte erforderlich.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="rounded-xl bg-[#c8985a] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#b07f42]"
            >
              Kostenlos testen
            </Link>
            <Link
              href="/kontakt"
              className="rounded-xl bg-white/10 px-6 py-3 text-sm font-medium text-white ring-1 ring-white/20 transition hover:bg-white/20"
            >
              Kontakt aufnehmen
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
