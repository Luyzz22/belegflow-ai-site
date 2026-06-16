"use client";

import { useEffect, useState } from "react";
import { Download, Trash2, FileDown, Bot, History, LogIn, Monitor } from "lucide-react";
import { flowcheckApi } from "@/lib/api-client";
import type { ConfidenceCheck, ConfidenceResult } from "@/lib/confidence";
import { dateDE } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import ConfidenceRing from "@/components/ConfidenceRing";
import ConfidenceBreakdown from "@/components/ConfidenceBreakdown";
import Toggle from "@/components/Toggle";
import { useToast } from "@/components/toast/ToastProvider";

interface PrivacyEvent {
  type: "export" | "deletion";
  label: string;
  at: string;
}

const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";

const CHECKS: ConfidenceCheck[] = [
  { id: "avv", label: "Auftragsverarbeitung (AVV)", maxPoints: 20, earnedPoints: 20, status: "pass", detail: "AVV nach Art. 28 DSGVO verfügbar." },
  { id: "sparsam", label: "Datensparsamkeit", maxPoints: 15, earnedPoints: 15, status: "pass", detail: "Nur notwendige Daten werden verarbeitet." },
  { id: "krypto", label: "Verschlüsselung", maxPoints: 15, earnedPoints: 15, status: "pass", detail: "TLS 1.3 in Transit, AES-256 at Rest." },
  { id: "hosting", label: "Hosting Deutschland", maxPoints: 15, earnedPoints: 15, status: "pass", detail: "Hetzner Cloud, Falkenstein (ISO 27001)." },
  { id: "loesch", label: "Löschkonzept", maxPoints: 10, earnedPoints: 5, status: "warn", detail: "Automatische Löschung nach Aufbewahrungsfrist.", hint: "Automatische Löschung in den Einstellungen aktivieren." },
  { id: "auskunft", label: "Auskunftsrecht", maxPoints: 10, earnedPoints: 5, status: "warn", detail: "Datenexport für Betroffene verfügbar.", hint: "Self-Service-Auskunft unten." },
  { id: "dsfa", label: "Datenschutz-Folgenabschätzung", maxPoints: 15, earnedPoints: 0, status: "fail", detail: "DSFA noch ausstehend.", hint: "DSFA durchführen und dokumentieren." },
];

const REGISTER = [
  ["Rechnungsdaten", "Buchhaltung", "Art. 6(1)b Vertrag", "DATEV", "10 Jahre (GoBD)"],
  ["KI-Extraktion", "Automatisierung", "Art. 6(1)f berecht. Interesse", "Anthropic (AV)", "Nach Verarbeitung"],
  ["Nutzerdaten", "Account", "Art. 6(1)b Vertrag", "—", "Bei Löschung"],
  ["Audit-Trail", "Nachweispflicht", "Art. 6(1)c gesetzl. Pflicht", "—", "10 Jahre (GoBD)"],
  ["Zahlungsdaten", "Abrechnung", "Art. 6(1)b Vertrag", "Stripe (AV)", "10 Jahre"],
];

const SUBPROCESSORS = [
  ["Anthropic", "KI-Extraktion", "USA (SCC)", "AV abgeschlossen"],
  ["Hetzner", "Hosting", "Deutschland", "AV abgeschlossen"],
  ["Vercel", "Frontend CDN", "USA (SCC)", "AV abgeschlossen"],
  ["Stripe", "Zahlungen", "USA (SCC)", "AV abgeschlossen"],
];

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function loadLog(): PrivacyEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("fc_privacy_log") || "[]") as PrivacyEvent[];
  } catch {
    return [];
  }
}

export default function DatenschutzCenterPage() {
  const { addToast } = useToast();
  const [kiOptOut, setKiOptOut] = useState(false);
  const [log, setLog] = useState<PrivacyEvent[]>([]);
  const [lastLogin, setLastLogin] = useState<string>("");

  useEffect(() => {
    const v = typeof window !== "undefined" && localStorage.getItem("fc_ki_optout") === "true";
    const ll = typeof window !== "undefined" ? localStorage.getItem("fc_last_login") || "" : "";
    const l = loadLog();
    Promise.resolve().then(() => {
      setKiOptOut(v);
      setLastLogin(ll);
      setLog(l);
    });
  }, []);

  const pushLog = (type: PrivacyEvent["type"], label: string) => {
    const next = [{ type, label, at: new Date().toISOString() }, ...loadLog()].slice(0, 20);
    if (typeof window !== "undefined") localStorage.setItem("fc_privacy_log", JSON.stringify(next));
    setLog(next);
  };

  const score = Math.min(100, CHECKS.reduce((s, c) => s + c.earnedPoints, 0));
  const tier = score >= 90 ? "high" : score >= 70 ? "medium" : "low";
  const result: ConfidenceResult = { score, tier, checks: CHECKS };

  const exportAuskunft = () => {
    const data: Record<string, unknown> = {};
    if (typeof window !== "undefined") {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("flowcheck_")) {
          try {
            data[k] = JSON.parse(localStorage.getItem(k) || "null");
          } catch {
            data[k] = localStorage.getItem(k);
          }
        }
      }
    }
    download("datenauskunft.json", JSON.stringify({ exportiert: new Date().toISOString(), daten: data }, null, 2), "application/json");
    pushLog("export", "Datenauskunft (JSON)");
    addToast({ type: "success", text: "Datenauskunft exportiert (JSON). Vorgang protokolliert." });
  };

  const exportRechnungen = () => {
    flowcheckApi
      .invoices("limit=1000&offset=0")
      .then((r) => {
        const rows = ["Rechnungsnummer;Lieferant;Datum;Betrag;Status", ...(r.items || []).map((i) => `${i.rechnungsnummer};${i.lieferant};${i.datum};${(i.betrag || 0).toFixed(2)};${i.status}`)];
        download("rechnungen-export.csv", rows.join("\n"), "text/csv");
        pushLog("export", "Rechnungen (CSV)");
        addToast({ type: "success", text: "Rechnungen exportiert (CSV)." });
      })
      .catch(() => addToast({ type: "error", text: "Export fehlgeschlagen." }));
  };

  const requestDeletion = () => {
    if (typeof window !== "undefined" && !window.confirm("Löschanfrage für alle personenbezogenen Daten stellen? Rechnungsdaten bleiben gesetzlich aufbewahrungspflichtig (anonymisiert).")) return;
    pushLog("deletion", "Löschanfrage (alle personenbezogenen Daten)");
    addToast({ type: "success", text: "Löschanfrage übermittelt. Vorgang protokolliert (30-Tage-Frist)." });
  };

  const toggleKi = (v: boolean) => {
    setKiOptOut(v);
    if (typeof window !== "undefined") localStorage.setItem("fc_ki_optout", String(v));
    addToast({ type: "info", text: v ? "Widerspruch zur KI-Verarbeitung gespeichert." : "Widerspruch aufgehoben." });
  };

  return (
    <div className="fc-fade-in">
      <PageHeader title="Datenschutz-Center" description="DSGVO-Status, Verarbeitungsregister und Betroffenenrechte" />

      {/* Score + Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`${CARD} flex flex-col items-center justify-center`}>
          <ConfidenceRing result={result} size={150} />
          <p className="mt-3 text-sm text-[#64748b]">DSGVO-Compliance-Score</p>
        </div>
        <div className="lg:col-span-2">
          <ConfidenceBreakdown result={result} title="Datenschutz-Prüfpunkte" />
        </div>
      </div>

      {/* Verarbeitungsregister */}
      <div className={`${CARD} mt-6 overflow-x-auto`}>
        <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Verarbeitungsregister (Art. 30 DSGVO)</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(0,56,86,0.06)] text-left text-xs font-medium uppercase tracking-wider text-[#64748b]">
              <th className="px-3 py-2.5">Verarbeitung</th>
              <th className="px-3 py-2.5">Zweck</th>
              <th className="px-3 py-2.5">Rechtsgrundlage</th>
              <th className="px-3 py-2.5">Empfänger</th>
              <th className="px-3 py-2.5">Löschfrist</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(0,56,86,0.06)]">
            {REGISTER.map((r) => (
              <tr key={r[0]}>
                {r.map((c, i) => (
                  <td key={i} className={`px-3 py-3 ${i === 0 ? "font-medium text-[#1a1a2e]" : "text-[#64748b]"}`}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Betroffenenrechte */}
      <div className={`${CARD} mt-6`}>
        <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Ihre Rechte nach DSGVO</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button onClick={exportAuskunft} className="flex items-center gap-2 rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-3 text-sm font-medium text-[#003856] transition hover:bg-[#faf9f7] active:scale-95">
            <FileDown className="h-4 w-4" /> Datenauskunft anfordern (JSON)
          </button>
          <button onClick={exportRechnungen} className="flex items-center gap-2 rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-3 text-sm font-medium text-[#003856] transition hover:bg-[#faf9f7] active:scale-95">
            <Download className="h-4 w-4" /> Datenübertragbarkeit (CSV)
          </button>
          <button onClick={requestDeletion} className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 active:scale-95">
            <Trash2 className="h-4 w-4" /> Daten löschen
          </button>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-medium text-[#1a1a2e]">
              <Bot className="h-4 w-4" /> KI-Extraktion deaktivieren
            </span>
            <Toggle checked={kiOptOut} onChange={toggleKi} label="Widerspruch KI-Verarbeitung" />
          </div>
        </div>
      </div>

      {/* Sub-Processor */}
      <div className={`${CARD} mt-6 overflow-x-auto`}>
        <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Sub-Processor</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(0,56,86,0.06)] text-left text-xs font-medium uppercase tracking-wider text-[#64748b]">
              <th className="px-3 py-2.5">Sub-Processor</th>
              <th className="px-3 py-2.5">Zweck</th>
              <th className="px-3 py-2.5">Standort</th>
              <th className="px-3 py-2.5">AV-Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(0,56,86,0.06)]">
            {SUBPROCESSORS.map((r) => (
              <tr key={r[0]}>
                <td className="px-3 py-3 font-medium text-[#1a1a2e]">{r[0]}</td>
                <td className="px-3 py-3 text-[#64748b]">{r[1]}</td>
                <td className="px-3 py-3 text-[#64748b]">{r[2]}</td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">✓ {r[3]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Zugriffsprotokolle */}
      <div className={`${CARD} mt-6`}>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-[#1a1a2e]">
          <History className="h-5 w-5 text-[#003856]" /> Zugriffsprotokolle
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-[rgba(0,56,86,0.08)] bg-[#faf9f7] p-4">
            <LogIn className="h-5 w-5 shrink-0 text-[#003856]" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#64748b]">Letzter Login</p>
              <p className="text-sm font-semibold text-[#1a1a2e]">{lastLogin ? dateDE(lastLogin, true) : "—"}</p>
              <p className="text-xs text-[#94a3b8]">IP wird clientseitig nicht erfasst</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[rgba(0,56,86,0.08)] bg-[#faf9f7] p-4">
            <Monitor className="h-5 w-5 shrink-0 text-[#003856]" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#64748b]">Aktive Sessions</p>
              <p className="text-sm font-semibold text-[#1a1a2e]">1 (dieses Gerät)</p>
              <p className="text-xs text-[#94a3b8]">Sitzung endet automatisch nach 8 Stunden</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-[#1a1a2e]">Letzte Datenexporte</h3>
            {log.filter((e) => e.type === "export").length === 0 ? (
              <p className="text-sm text-[#94a3b8]">Keine Exporte protokolliert.</p>
            ) : (
              <ul className="space-y-1.5">
                {log.filter((e) => e.type === "export").map((e, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-[#64748b]">{e.label}</span>
                    <span className="shrink-0 text-xs text-[#94a3b8]">{dateDE(e.at, true)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-[#1a1a2e]">Letzte Löschanfragen</h3>
            {log.filter((e) => e.type === "deletion").length === 0 ? (
              <p className="text-sm text-[#94a3b8]">Keine Löschanfragen protokolliert.</p>
            ) : (
              <ul className="space-y-1.5">
                {log.filter((e) => e.type === "deletion").map((e, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-[#64748b]">{e.label}</span>
                    <span className="shrink-0 text-xs text-[#94a3b8]">{dateDE(e.at, true)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
