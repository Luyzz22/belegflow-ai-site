import type { Metadata } from "next";
import {
  Server,
  ShieldCheck,
  Bot,
  FileCheck,
  Award,
  Lock,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import PublicPage from "@/components/PublicPage";

export const metadata: Metadata = {
  title: "Sicherheit & Compliance",
  description: "Sicherheit, Datenschutz und Compliance von FlowCheck AI+ — DSGVO, EU AI Act, GoBD, NIS2, Hosting Deutschland.",
};

const SECTIONS: { icon: LucideIcon; title: string; points: string[] }[] = [
  {
    icon: Server,
    title: "Infrastruktur",
    points: [
      "Hosting ausschließlich in Deutschland (Hetzner, Falkenstein/Nürnberg).",
      "Rechenzentren nach ISO 27001 zertifiziert.",
      "TLS 1.3 in der Übertragung, AES-256 im Ruhezustand.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Datenschutz",
    points: [
      "DSGVO-konform, Auftragsverarbeitung nach Art. 28.",
      "Dokumentiertes Löschkonzept (GoBD-Fristen).",
      "Rollenbasierte Zugriffskontrolle.",
    ],
  },
  {
    icon: Bot,
    title: "KI-Governance",
    points: [
      "EU AI Act: begrenztes Risiko, Transparenzpflichten Art. 50.",
      "Human-in-the-Loop — keine automatische Freigabe.",
      "Erklärbarkeit über Confidence-Breakdown.",
    ],
  },
  {
    icon: FileCheck,
    title: "Compliance",
    points: [
      "GoBD-konforme, revisionssichere Protokollierung.",
      "§14 UStG-Prüfung aller Rechnungen.",
      "NIS2-Readiness inkl. Incident-Response-Plan.",
    ],
  },
  {
    icon: Award,
    title: "Zertifizierungen",
    points: [
      "ISO 27001 — Roadmap (in Vorbereitung).",
      "SOC 2 — geplant.",
      "Keine Fremdzertifikate ohne Nachweis.",
    ],
  },
];

const BADGES: { icon: LucideIcon; label: string }[] = [
  { icon: MapPin, label: "Hosting Deutschland" },
  { icon: ShieldCheck, label: "DSGVO-konform" },
  { icon: FileCheck, label: "GoBD-ready" },
  { icon: Bot, label: "EU AI Act ready" },
  { icon: Lock, label: "NIS2-ready" },
  { icon: Award, label: "ISO 27001 Roadmap" },
];

export default function SicherheitPage() {
  return (
    <PublicPage title="Sicherheit & Compliance">
      <p className="-mt-2 mb-8 max-w-2xl text-base text-[#64748b]">
        Sicherheit hat höchste Priorität. FlowCheck AI+ ist von Grund auf für deutsche und europäische
        Compliance-Anforderungen entwickelt.
      </p>

      {/* Trust-Badges */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {BADGES.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-stone-200/60">
            <Icon className="h-5 w-5 shrink-0 text-[#c8985a]" />
            <span className="text-sm font-medium text-[#1a1a2e]">{label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-5">
        {SECTIONS.map(({ icon: Icon, title, points }) => (
          <section key={title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/60">
            <h2 className="flex items-center gap-2.5 text-lg font-semibold text-[#003856]">
              <Icon className="h-5 w-5 text-[#c8985a]" />
              {title}
            </h2>
            <ul className="mt-3 space-y-1.5">
              {points.map((p) => (
                <li key={p} className="flex gap-2 text-sm text-[#64748b]">
                  <span className="text-[#c8985a]">•</span>
                  {p}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-8 text-sm text-[#64748b]">
        Fragen zur Sicherheit?{" "}
        <a href="mailto:ki@sbsdeutschland.de" className="font-medium text-[#003856] hover:underline">
          ki@sbsdeutschland.de
        </a>
      </p>
    </PublicPage>
  );
}
