"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Rocket,
  Upload,
  Zap,
  Landmark,
  ShieldCheck,
  Lock,
  HelpCircle,
  Mail,
  Search,
  type LucideIcon,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";

interface Section {
  id: string;
  icon: LucideIcon;
  title: string;
  body: { h?: string; p?: string; list?: string[] }[];
}

const SECTIONS: Section[] = [
  {
    id: "start",
    icon: Rocket,
    title: "Erste Schritte",
    body: [
      { p: "In drei Schritten startklar:" },
      { list: [
        "1. Rechnung hochladen (PDF, Scan oder XRechnung/ZUGFeRD).",
        "2. KI prüft automatisch: Felder, §14-Pflichtangaben, IBAN, Kontierung.",
        "3. Im Review-Modus freigeben und als DATEV-Stapel exportieren.",
      ] },
    ],
  },
  {
    id: "upload",
    icon: Upload,
    title: "Rechnungen hochladen",
    body: [
      { p: "Unterstützte Formate: PDF, JPEG, PNG sowie elektronische Rechnungen (XRechnung, ZUGFeRD)." },
      { p: "Sie können mehrere Dateien gleichzeitig per Drag-and-Drop hochladen. XRechnung/ZUGFeRD werden ohne KI-Aufruf deterministisch geparst." },
    ],
  },
  {
    id: "review",
    icon: Zap,
    title: "Review-Modus",
    body: [
      { p: "Prüfen und freigeben Sie Rechnungen im Schnelldurchlauf." },
      { h: "Tastenkürzel", list: ["F — Freigeben", "A — Ablehnen", "→ / J — Nächste", "← / K — Vorherige", "E — Exportieren", "Esc — Verlassen"] },
      { p: "Auf dem Smartphone: nach rechts wischen = freigeben, nach links = ablehnen." },
    ],
  },
  {
    id: "datev",
    icon: Landmark,
    title: "DATEV-Export",
    body: [
      { list: [
        "1. Öffnen Sie „DATEV-Export“ in der Seitenleiste.",
        "2. Prüfen Sie die Vorschau der Buchungssätze.",
        "3. Klicken Sie „DATEV-CSV herunterladen“ — fertig.",
      ] },
      { p: "Jeder Export wird revisionssicher mit Prüfsumme im Audit-Trail protokolliert." },
    ],
  },
  {
    id: "freigabe",
    icon: ShieldCheck,
    title: "Freigabe-Workflow",
    body: [
      { p: "Unter Einstellungen → Allgemein legen Sie Betragsgrenzen fest:" },
      { list: ["Stufe 1 (Sachbearbeiter) bis Betrag X", "Stufe 2 (Teamleiter) bis Betrag Y", "Darüber: Geschäftsführung"] },
      { p: "Optional aktivieren Sie die automatische Freigabe für Kleinbeträge." },
    ],
  },
  {
    id: "sicherheit",
    icon: Lock,
    title: "Sicherheit",
    body: [
      { p: "FlowCheck AI+ verwendet ausschließlich aktuelle und geprüfte Open-Source-Bibliotheken. Regelmäßige Dependency-Audits (npm audit) werden durchgeführt und Sicherheitsupdates zeitnah eingespielt." },
      { h: "Technische Schutzmaßnahmen", list: [
        "Übertragung ausschließlich über TLS 1.3, Encryption at Rest (AES-256).",
        "Strikte Security-Header inkl. Content-Security-Policy (CSP).",
        "Eingabe-Sanitisierung und XSS-Schutz im Frontend.",
        "Automatische Sitzungsbeendigung nach 8 Stunden.",
        "Rate-Limiting und Fail2ban auf den Authentifizierungs-Endpoints.",
      ] },
      { p: "Den aktuellen Status der Security-Header können Sie jederzeit im Compliance-Center unter „Security-Headers Audit“ selbst überprüfen." },
    ],
  },
  {
    id: "faq",
    icon: HelpCircle,
    title: "FAQ",
    body: [
      { h: "Ist FlowCheck DSGVO-konform?", p: "Ja — Hosting ausschließlich in deutschen Rechenzentren, AVV inklusive." },
      { h: "Was bedeutet GoBD-ready?", p: "Belege und Verarbeitungsschritte werden revisionssicher und unveränderbar protokolliert." },
      { h: "Kann ich jederzeit kündigen?", p: "Ja, alle Tarife sind monatlich kündbar." },
      { h: "Gibt es eine API?", p: "Ja, im Enterprise-Plan." },
    ],
  },
  {
    id: "kontakt",
    icon: Mail,
    title: "Kontakt",
    body: [
      { p: "Wir helfen gerne weiter:" },
      { list: ["E-Mail: ki@sbsdeutschland.de", "Telefon: +49 (0) 30 1234567", "Mo–Fr 9–17 Uhr"] },
    ],
  },
];

const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";

export default function HilfePage() {
  const [activeId, setActiveId] = useState("start");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTIONS;
    return SECTIONS.filter((s) => {
      const text = `${s.title} ${s.body.map((b) => `${b.h ?? ""} ${b.p ?? ""} ${(b.list ?? []).join(" ")}`).join(" ")}`.toLowerCase();
      return text.includes(q);
    });
  }, [query]);

  const active = (query ? filtered : SECTIONS).find((s) => s.id === activeId) ?? filtered[0] ?? SECTIONS[0];

  return (
    <div className="fc-fade-in">
      <PageHeader title="Hilfe-Center" description="Anleitungen, Tastenkürzel und Antworten" />

      <div className="mb-6 relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hilfe durchsuchen …"
          aria-label="Hilfe durchsuchen"
          className="w-full rounded-xl border border-[rgba(0,56,86,0.12)] bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        {/* Section-Nav */}
        <nav className="flex flex-row flex-wrap gap-2 lg:flex-col">
          {filtered.map((s) => {
            const Icon = s.icon;
            const isActive = active?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={`inline-flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition active:scale-95 ${
                  isActive ? "bg-[#003856] text-white" : "bg-white text-[#64748b] ring-1 ring-[rgba(0,56,86,0.08)] hover:bg-[#faf9f7] hover:text-[#003856]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {s.title}
              </button>
            );
          })}
          {filtered.length === 0 && <p className="text-sm text-[#64748b]">Keine Treffer.</p>}
        </nav>

        {/* Content */}
        {active && (
          <div className={CARD}>
            <h2 className="flex items-center gap-2.5 text-2xl font-bold text-[#1a1a2e]">
              <active.icon className="h-6 w-6 text-[#c8985a]" />
              {active.title}
            </h2>
            <div className="mt-5 space-y-4">
              {active.body.map((b, i) => (
                <div key={i}>
                  {b.h && <h3 className="font-semibold text-[#1a1a2e]">{b.h}</h3>}
                  {b.p && <p className="mt-1 text-sm leading-relaxed text-[#64748b]">{b.p}</p>}
                  {b.list && (
                    <ul className="mt-1 space-y-1.5">
                      {b.list.map((l, j) => (
                        <li key={j} className="flex gap-2 text-sm text-[#64748b]">
                          <span className="text-[#c8985a]">•</span>
                          {l}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            {active.id === "kontakt" && (
              <a
                href="mailto:ki@sbsdeutschland.de"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95"
              >
                <Mail className="h-4 w-4" /> E-Mail schreiben
              </a>
            )}
          </div>
        )}
      </div>

      <p className="mt-6 text-sm text-[#64748b]">
        Nicht fündig geworden?{" "}
        <Link href="/kontakt" className="font-medium text-[#003856] hover:underline">
          Kontaktieren Sie uns
        </Link>
        .
      </p>
    </div>
  );
}
