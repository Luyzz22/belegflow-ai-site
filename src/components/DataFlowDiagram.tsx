"use client";

import { useState } from "react";
import { Monitor, Cloud, Server, Database, Bot, CheckCircle2, ArrowDown, type LucideIcon } from "lucide-react";

interface Node {
  id: string;
  icon: LucideIcon;
  title: string;
  edge: string;
  detail: string;
}

const NODES: Node[] = [
  { id: "browser", icon: Monitor, title: "Ihr Browser", edge: "TLS 1.3 verschlüsselt", detail: "Die Übertragung erfolgt ausschließlich über TLS 1.3. Es werden keine sensiblen Daten im Browser dauerhaft gespeichert." },
  { id: "vercel", icon: Cloud, title: "Vercel CDN", edge: "nur statische Auslieferung", detail: "Vercel liefert ausschließlich statische Frontend-Dateien (HTML/JS/CSS) über das globale Edge-Netzwerk aus. Kein Zugriff auf Ihre Rechnungsdaten." },
  { id: "hetzner", icon: Server, title: "Hetzner Server 🇩🇪", edge: "Anwendungslogik", detail: "Falkenstein/Nürnberg, ISO/IEC 27001 zertifiziert, deutsches Recht. Hier läuft die Anwendungslogik (non-root Service-User)." },
  { id: "neon", icon: Database, title: "Neon PostgreSQL 🇩🇪", edge: "AES-256 at Rest", detail: "Frankfurt (eu-central-1). Encryption at Rest (AES-256), automatische Backups und Point-in-Time Recovery." },
  { id: "anthropic", icon: Bot, title: "Anthropic API", edge: "nur Text · kein Speichern", detail: "Nur der zur Extraktion notwendige Rechnungstext wird temporär übermittelt. Zero Data Retention — keine Speicherung, kein Training mit Ihren Daten." },
  { id: "result", icon: CheckCircle2, title: "Ergebnis an Sie", edge: "zurück über TLS 1.3", detail: "Das extrahierte Ergebnis wird verschlüsselt an Ihre Anwendung zurückgegeben. Die Freigabe trifft immer ein Mensch." },
];

export default function DataFlowDiagram() {
  const [active, setActive] = useState<string>("anthropic");
  const node = NODES.find((n) => n.id === active) ?? NODES[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Flow */}
      <ol className="flex flex-col items-center gap-0">
        {NODES.map((n, i) => {
          const Icon = n.icon;
          const isActive = n.id === active;
          return (
            <li key={n.id} className="flex w-full max-w-md flex-col items-center">
              <button
                onClick={() => setActive(n.id)}
                aria-pressed={isActive}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all active:scale-[0.98] ${
                  isActive
                    ? "border-[#003856] bg-[#003856] text-white shadow-md"
                    : "border-[rgba(0,56,86,0.12)] bg-white text-[#1a1a2e] hover:border-[#003856]/40 hover:bg-[#faf9f7]"
                }`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isActive ? "bg-white/15 text-white" : "bg-[#003856]/5 text-[#003856]"}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{n.title}</span>
                  <span className={`block text-xs ${isActive ? "text-white/75" : "text-[#64748b]"}`}>{n.edge}</span>
                </span>
              </button>
              {i < NODES.length - 1 && <ArrowDown className="my-1 h-5 w-5 text-[#c8985a]" />}
            </li>
          );
        })}
      </ol>

      {/* Detail */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-[rgba(0,56,86,0.08)] bg-[#faf9f7] p-5">
          <div className="flex items-center gap-2.5">
            <node.icon className="h-5 w-5 text-[#003856]" />
            <h3 className="text-base font-semibold text-[#003856]">{node.title}</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#64748b]">{node.detail}</p>
          <p className="mt-4 text-xs text-[#94a3b8]">Knoten antippen, um Details zu sehen.</p>
        </div>
      </aside>
    </div>
  );
}
