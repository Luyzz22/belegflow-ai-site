import type { Metadata } from "next";
import Link from "next/link";
import {
  Server,
  Database,
  Lock,
  ShieldCheck,
  EyeOff,
  FileText,
  ScrollText,
  CheckCircle2,
  ClipboardList,
  Mail,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import PublicPage from "@/components/PublicPage";
import DataFlowDiagram from "@/components/DataFlowDiagram";

export const metadata: Metadata = {
  title: "Trust Center — Vertrauen & Sicherheit",
  description:
    "FlowCheck AI+ Trust Center: Hosting in Deutschland, DSGVO, EU AI Act, GoBD, NIS2, Sub-Processor-Transparenz und Datenfluss.",
};

const CARD = "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/60";
const H2 = "text-2xl font-semibold tracking-tight text-[#003856]";

const INFRA: { icon: LucideIcon; flag?: string; title: string; lines: string[] }[] = [
  {
    icon: Server,
    flag: "🇩🇪",
    title: "Hosting in Deutschland",
    lines: ["Hetzner Cloud, Falkenstein/Nürnberg", "ISO/IEC 27001:2022 zertifiziert", "Deutsches Datenschutzrecht"],
  },
  {
    icon: Database,
    title: "Datenbank",
    lines: ["Neon PostgreSQL, Frankfurt (eu-central-1)", "Encryption at Rest (AES-256)", "Automatische Backups + Point-in-Time Recovery"],
  },
  {
    icon: Lock,
    title: "Verschlüsselung",
    lines: ["TLS 1.3 für alle Verbindungen", "AES-256 Encryption at Rest", "Keine Datenspeicherung bei KI-Providern"],
  },
];

const DSGVO_ARTICLES = [
  ["Art. 25", "Privacy by Design & Default"],
  ["Art. 28", "Auftragsverarbeitung (AVV verfügbar)"],
  ["Art. 30", "Verarbeitungsverzeichnis geführt"],
  ["Art. 32", "Technisch-organisatorische Maßnahmen"],
  ["Art. 35", "DSFA-Bereitschaft"],
];

const KI_PRINCIPLES = [
  ["Mensch entscheidet — KI empfiehlt", "Keine automatische Freigabe ohne menschliche Bestätigung."],
  ["Nachvollziehbar", "Jede Extraktion ist über den Confidence-Breakdown überprüfbar."],
  ["Datensparsam", "Nur die notwendigen Daten werden an das LLM übermittelt."],
  ["Kein Training", "Ihre Daten trainieren keine Modelle (Zero Data Retention)."],
];

const COMPLIANCE: [string, string, string][] = [
  ["DSGVO", "✅ Konform", "AVV, TOM, Löschkonzept"],
  ["EU AI Act", "✅ Bereit", "Art. 50 ab 02.08.2026"],
  ["GoBD", "✅ Konform", "SHA-256, 10 Jahre Aufbewahrung"],
  ["§14 UStG", "✅ Automatisch", "Pflichtangaben-Prüfung"],
  ["NIS2", "✅ Bereit", "Incident-Response-Plan"],
  ["ISO 27001", "📋 Roadmap", "Zertifizierung geplant"],
];

const SUBPROCESSORS: [string, string, string, string][] = [
  ["Anthropic", "KI-Extraktion", "USA (SCC)", "Rechnungstext (temporär)"],
  ["Hetzner", "Server", "Deutschland", "Infrastruktur"],
  ["Neon", "Datenbank", "Deutschland", "Verschlüsselt"],
  ["Vercel", "Frontend CDN", "Global Edge", "Kein Datenzugriff"],
  ["Stripe", "Zahlung", "USA (SCC)", "Nur Zahlungsdaten"],
];

const SECURITY_MEASURES = [
  "Automatisierte Dependency-Scans (Dependabot)",
  "OWASP-Top-10-Härtung",
  "Rate-Limiting auf allen Auth-Endpoints",
  "Fail2ban gegen Brute-Force",
];

function DocButton({ href, icon: Icon, children }: { href: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-xl border border-[rgba(0,56,86,0.12)] bg-white px-4 py-2.5 text-sm font-medium text-[#003856] transition hover:bg-[#faf9f7] active:scale-95"
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}

export default function TrustPage() {
  return (
    <PublicPage
      title="Vertrauen & Sicherheit"
      subtitle="FlowCheck AI+ wurde von Grund auf für den Schutz Ihrer sensiblen Finanzdaten entwickelt."
    >
      <div className="space-y-16">
        {/* b) Infrastruktur */}
        <section>
          <h2 className={H2}>Infrastruktur & Hosting</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {INFRA.map(({ icon: Icon, flag, title, lines }) => (
              <div key={title} className={CARD}>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#003856]/5 text-[#003856]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-base font-semibold text-[#1a1a2e]">
                    {flag ? `${flag} ` : ""}
                    {title}
                  </h3>
                </div>
                <ul className="mt-4 space-y-1.5">
                  {lines.map((l) => (
                    <li key={l} className="flex gap-2 text-sm text-[#64748b]">
                      <span className="text-[#c8985a]">•</span>
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* c) Datenschutz */}
        <section>
          <h2 className={H2}>Datenschutz (DSGVO)</h2>
          <div className={`${CARD} mt-6`}>
            <ul className="space-y-2.5">
              {DSGVO_ARTICLES.map(([art, txt]) => (
                <li key={art} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>
                    <span className="font-semibold text-[#003856]">{art}:</span>{" "}
                    <span className="text-[#64748b]">{txt}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <DocButton href="/trust/avv" icon={FileText}>AVV herunterladen (PDF)</DocButton>
              <DocButton href="/trust/tom" icon={ScrollText}>TOM einsehen</DocButton>
              <DocButton href="/datenschutz" icon={ClipboardList}>Verarbeitungsverzeichnis</DocButton>
            </div>
          </div>
        </section>

        {/* d) KI-Governance */}
        <section>
          <h2 className={H2}>Wie FlowCheck KI einsetzt</h2>
          <div className={`${CARD} mt-6`}>
            <ul className="space-y-2.5">
              {[
                "KI extrahiert Daten, trifft KEINE Entscheidungen",
                "Keine automatische Freigabe ohne menschliche Bestätigung",
                "EU AI Act Art. 50 konform (Transparenzpflichten)",
                "Keine Speicherung von Daten bei Anthropic/OpenAI",
                "Modell-Transparenz: welches Modell, welche Kosten",
              ].map((l) => (
                <li key={l} className="flex items-start gap-3 text-sm text-[#64748b]">
                  <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-[#003856]" />
                  {l}
                </li>
              ))}
            </ul>
          </div>
          <h3 className="mt-8 text-lg font-semibold text-[#003856]">KI-Prinzipien</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {KI_PRINCIPLES.map(([title, desc], i) => (
              <div key={title} className={CARD}>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#003856] text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="text-sm font-semibold text-[#1a1a2e]">{title}</p>
                </div>
                <p className="mt-2 text-sm text-[#64748b]">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* e) Compliance-Übersicht */}
        <section>
          <h2 className={H2}>Compliance-Übersicht</h2>
          <div className={`${CARD} mt-6 overflow-x-auto`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-xs font-medium uppercase tracking-wider text-[#64748b]">
                  <th className="px-3 py-2.5">Norm</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {COMPLIANCE.map(([norm, status, details]) => (
                  <tr key={norm}>
                    <td className="px-3 py-3 font-medium text-[#1a1a2e]">{norm}</td>
                    <td className="px-3 py-3 font-semibold text-[#003856]">{status}</td>
                    <td className="px-3 py-3 text-[#64748b]">{details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Datenfluss */}
        <section>
          <h2 className={H2}>Wie Ihre Daten fließen</h2>
          <p className="mt-2 max-w-2xl text-sm text-[#64748b]">
            Jeder Knoten ist anklickbar und zeigt, welche Daten dort verarbeitet werden.
          </p>
          <div className="mt-6">
            <DataFlowDiagram />
          </div>
        </section>

        {/* f) Sub-Processor */}
        <section>
          <h2 className={H2}>Sub-Processor-Transparenz</h2>
          <div className={`${CARD} mt-6 overflow-x-auto`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-xs font-medium uppercase tracking-wider text-[#64748b]">
                  <th className="px-3 py-2.5">Anbieter</th>
                  <th className="px-3 py-2.5">Zweck</th>
                  <th className="px-3 py-2.5">Standort</th>
                  <th className="px-3 py-2.5">Datenzugriff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {SUBPROCESSORS.map(([name, zweck, ort, zugriff]) => (
                  <tr key={name}>
                    <td className="px-3 py-3 font-medium text-[#1a1a2e]">{name}</td>
                    <td className="px-3 py-3 text-[#64748b]">{zweck}</td>
                    <td className="px-3 py-3 text-[#64748b]">{ort}</td>
                    <td className="px-3 py-3 text-[#64748b]">{zugriff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-sm text-[#64748b]">
              Anthropic speichert keine Kundendaten. API-Aufrufe werden nicht für Modell-Training verwendet
              (Zero Data Retention).
            </p>
            <a
              href="https://www.anthropic.com/legal/commercial-terms"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#003856] hover:underline"
            >
              Anthropic Usage Policy <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </section>

        {/* g) Pen-Testing */}
        <section>
          <h2 className={H2}>Sicherheitsüberprüfungen & Audits</h2>
          <div className={`${CARD} mt-6`}>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-[#c8985a]" />
              <h3 className="text-base font-semibold text-[#1a1a2e]">Regelmäßige Sicherheitsüberprüfungen</h3>
            </div>
            <ul className="mt-4 space-y-1.5">
              {SECURITY_MEASURES.map((m) => (
                <li key={m} className="flex gap-2 text-sm text-[#64748b]">
                  <span className="text-[#c8985a]">•</span>
                  {m}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-[#94a3b8]">Letzter Security-Review: Juni 2026</p>
          </div>
        </section>

        {/* h) Kontakt */}
        <section>
          <h2 className={H2}>Fragen zu Sicherheit & Datenschutz?</h2>
          <div className={`${CARD} mt-6`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1 text-sm text-[#64748b]">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#003856]" /> Datenschutz:{" "}
                  <a href="mailto:ki@sbsdeutschland.de" className="font-medium text-[#003856] hover:underline">ki@sbsdeutschland.de</a>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#003856]" /> Security:{" "}
                  <a href="mailto:ki@sbsdeutschland.de" className="font-medium text-[#003856] hover:underline">ki@sbsdeutschland.de</a>
                </p>
              </div>
              <span className="rounded-xl bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
                Antwort innerhalb von 24 Stunden
              </span>
            </div>
          </div>
        </section>
      </div>
    </PublicPage>
  );
}
