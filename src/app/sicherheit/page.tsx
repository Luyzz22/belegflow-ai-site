import type { Metadata } from "next";
import Link from "next/link";
import {
  Server,
  ShieldCheck,
  Bot,
  FileCheck,
  Award,
  Lock,
  MapPin,
  Eye,
  Activity,
  Key,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import PublicPage from "@/components/PublicPage";

export const metadata: Metadata = {
  title: "Sicherheit & Compliance",
  description: "Sicherheit, Datenschutz und Compliance von FlowCheck AI+ — DSGVO, GoBD 2025, EU AI Act, KoSIT EN 16931, NIS2, Hosting Deutschland.",
};

const SECTIONS: { icon: LucideIcon; title: string; badge?: string; points: string[] }[] = [
  {
    icon: Server,
    title: "Infrastruktur & Hosting",
    badge: "🇩🇪 Deutschland",
    points: [
      "Hosting ausschließlich in deutschen Rechenzentren (ISO 27001 zertifiziert).",
      "Neon PostgreSQL Frankfurt (eu-central-1) — Encryption at Rest (AES-256), Point-in-Time Recovery.",
      "TLS 1.3 in der Übertragung, AES-256 im Ruhezustand für alle Rechnungsdaten.",
      "Sentry-Monitoring aktiv (Production, DSN konfiguriert).",
      "SLA 99,5 % im Enterprise-Plan vertraglich vereinbart.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Datenschutz (DSGVO)",
    points: [
      "DSGVO-konform, Auftragsverarbeitung nach Art. 28 — AVV als Download unter /avv.",
      "Technisch-organisatorische Maßnahmen (TOM) vollständig dokumentiert — /trust/tom.",
      "Dokumentiertes Löschkonzept nach GoBD-Fristen und § 17 DSGVO.",
      "Rollenbasierte Zugriffskontrolle (RBAC), Trennung von Mandantendaten.",
      "Sub-Processor-Liste transparent veröffentlicht: Anthropic (USA/SCC), Hetzner (DE), Neon (DE).",
    ],
  },
  {
    icon: Bot,
    title: "KI-Governance & EU AI Act",
    badge: "Art. 50 konform",
    points: [
      "EU AI Act: begrenztes Risiko — Transparenzpflichten nach Art. 50 (ab 02.08.2026 verpflichtend).",
      "Human-in-the-Loop — keine automatische Freigabe ohne menschliche Bestätigung.",
      "Erklärbarkeit über Confidence-Score und Reasoning-Breakdown bei jeder KI-Kontierung.",
      "Zero Data Retention bei Anthropic — Rechnungsdaten werden nicht für Modell-Training genutzt.",
      "Modell-Transparenz: Gemini 2.5 Flash (primär), Claude Sonnet 4 (Fallback).",
    ],
  },
  {
    icon: FileCheck,
    title: "GoBD 2025 & E-Rechnung",
    badge: "GoBD 2025",
    points: [
      "GoBD-konforme, revisionssichere Protokollierung: vollständiger Audit-Trail (invoice_events).",
      "SHA-256-Hash-Sicherung aller archivierten Dokumente — Unveränderbarkeit nachweisbar.",
      "Strukturierter Datenteil (XRechnung/ZUGFeRD) reicht zur Archivierung nach GoBD 2025 BMF-Schreiben.",
      "KoSIT-Validierung (EN 16931) — Valid: true, Errors: 0 bei XRechnung und ZUGFeRD 2.1.",
      "§14 UStG-Prüfung aller Rechnungen automatisch bei Eingang und Ausgang.",
      "NIS2-Readiness inkl. dokumentiertem Incident-Response-Plan.",
    ],
  },
  {
    icon: Eye,
    title: "Anwendungssicherheit",
    points: [
      "OWASP-Top-10-Härtung auf allen Endpunkten.",
      "Rate-Limiting auf allen Auth-Endpoints gegen Brute-Force.",
      "CSP (Content Security Policy) mit Violation-Reporting aktiv.",
      "Automatisierte Dependency-Scans (Dependabot) für alle Pakete.",
      ".env nicht im Repository — Secret-Management über Umgebungsvariablen.",
    ],
  },
  {
    icon: Key,
    title: "Zugriffskontrolle",
    points: [
      "Rollenbasierte Zugriffskontrolle (RBAC): Admin, Finance, Viewer.",
      "Session-Security mit automatischem Token-Ablauf.",
      "Audit-Log bei jedem Zugriffsversuch auf Rechnungsdaten.",
      "SSO / SAML 2.0 — in Vorbereitung (Enterprise-Plan).",
    ],
  },
  {
    icon: Activity,
    title: "Monitoring & Incident Response",
    points: [
      "Sentry Error-Tracking (Production) — Echtzeit-Alerting.",
      "Systemstatus öffentlich unter /status einsehbar.",
      "Dokumentierter Incident-Response-Plan (NIS2-Anforderungen).",
      "Security-Meldungen an: ki@sbsdeutschland.de.",
    ],
  },
  {
    icon: Award,
    title: "Zertifizierungen & Roadmap",
    points: [
      "ISO 27001 — Roadmap (Zertifizierung in Vorbereitung).",
      "SOC 2 Type II — geplant.",
      "BSI IT-Grundschutz — Teilbereiche in Prüfung.",
      "Keine Zertifikats-Claims ohne verifizierten Nachweis.",
    ],
  },
];

const BADGES: { icon: LucideIcon; label: string }[] = [
  { icon: MapPin, label: "🇩🇪 Hosting Deutschland" },
  { icon: ShieldCheck, label: "DSGVO konform" },
  { icon: FileCheck, label: "GoBD 2025 konform" },
  { icon: FileCheck, label: "KoSIT EN 16931" },
  { icon: Bot, label: "EU AI Act ready" },
  { icon: Lock, label: "NIS2-ready" },
  { icon: Activity, label: "Sentry-Monitoring" },
  { icon: Award, label: "ISO 27001 Roadmap" },
];

export default function SicherheitPage() {
  return (
    <PublicPage title="Sicherheit & Compliance">
      <p className="-mt-2 mb-8 max-w-2xl text-base text-[#64748b]">
        FlowCheck AI+ ist von Grund auf für deutsche und europäische Compliance-Anforderungen entwickelt —
        GoBD 2025, DSGVO Art. 28, EU AI Act und KoSIT-Validierung (EN 16931).
      </p>

      {/* Trust-Badges */}
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {BADGES.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2.5 rounded-xl bg-white p-3.5 shadow-sm ring-1 ring-stone-200/60">
            <Icon className="h-4 w-4 shrink-0 text-[#c8985a]" />
            <span className="text-xs font-medium text-[#1a1a2e]">{label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-5">
        {SECTIONS.map(({ icon: Icon, title, badge, points }) => (
          <section key={title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/60">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="flex items-center gap-2.5 text-lg font-semibold text-[#003856]">
                <Icon className="h-5 w-5 text-[#c8985a]" />
                {title}
              </h2>
              {badge && (
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {badge}
                </span>
              )}
            </div>
            <ul className="mt-3 space-y-1.5">
              {points.map((p) => (
                <li key={p} className="flex gap-2 text-sm text-[#64748b]">
                  <span className="mt-0.5 text-[#c8985a]">•</span>
                  {p}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/trust"
          className="inline-flex items-center gap-2 rounded-xl border border-[#003856]/15 bg-white px-4 py-2.5 text-sm font-medium text-[#003856] shadow-sm transition hover:bg-[#003856]/5"
        >
          Trust Center <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/avv"
          className="inline-flex items-center gap-2 rounded-xl border border-[#003856]/15 bg-white px-4 py-2.5 text-sm font-medium text-[#003856] shadow-sm transition hover:bg-[#003856]/5"
        >
          AVV (DSGVO Art. 28) <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/trust/tom"
          className="inline-flex items-center gap-2 rounded-xl border border-[#003856]/15 bg-white px-4 py-2.5 text-sm font-medium text-[#003856] shadow-sm transition hover:bg-[#003856]/5"
        >
          TOM einsehen <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <p className="mt-6 text-sm text-[#64748b]">
        Sicherheitsmeldungen und Fragen:{" "}
        <a href="mailto:ki@sbsdeutschland.de" className="font-medium text-[#003856] hover:underline">
          ki@sbsdeutschland.de
        </a>{" "}
        — Antwort innerhalb von 24 Stunden.
      </p>
    </PublicPage>
  );
}
