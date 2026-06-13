"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Printer,
  CloudUpload,
  ShieldCheck,
  XCircle,
  Download,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { flowcheckApi, type AuditEntry } from "@/lib/api-client";
import { loadSettings } from "@/lib/settings";
import { dateDE } from "@/lib/format";
import type { ConfidenceCheck, ConfidenceResult } from "@/lib/confidence";
import PageHeader from "@/components/PageHeader";
import ConfidenceRing from "@/components/ConfidenceRing";
import ConfidenceBreakdown from "@/components/ConfidenceBreakdown";
import { LoadingState, ErrorState } from "@/components/States";

const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";

function eventMeta(aktion: string): { icon: LucideIcon; cls: string; ring: string } {
  const a = (aktion || "").toLowerCase();
  if (a.includes("upload")) return { icon: CloudUpload, cls: "text-blue-600", ring: "bg-blue-50" };
  if (a.includes("freig") || a.includes("genehm")) return { icon: ShieldCheck, cls: "text-emerald-600", ring: "bg-emerald-50" };
  if (a.includes("ablehn") || a.includes("reject")) return { icon: XCircle, cls: "text-red-600", ring: "bg-red-50" };
  if (a.includes("export")) return { icon: Download, cls: "text-slate-500", ring: "bg-slate-100" };
  return { icon: Activity, cls: "text-[#003856]", ring: "bg-[#003856]/5" };
}

export default function ComplianceCenterPage() {
  const [result, setResult] = useState<ConfidenceResult | null>(null);
  const [events, setEvents] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([
      flowcheckApi.audit("limit=200&offset=0").catch(() => ({ items: [] as AuditEntry[], total: 0 })),
      flowcheckApi.invoices("limit=1&offset=0").catch(() => ({ items: [], total: 0 })),
    ])
      .then(([audit, inv]) => {
        const s = loadSettings();
        const auditTotal = audit.total || audit.items.length;
        const earliest =
          audit.items.length > 0
            ? audit.items.reduce((min, a) => (a.zeitpunkt < min ? a.zeitpunkt : min), audit.items[0].zeitpunkt)
            : "";
        const hasDatev = audit.items.some((a) => (a.aktion || "").toLowerCase().includes("export"));
        const invoiceCount = inv.total || 0;
        const freigabeAktiv = s.freigabe.stufe1 > 0 && s.freigabe.stufe2 > 0;
        const multiAugen = s.freigabe.stufe2 >= 1;

        const checks: ConfidenceCheck[] = [
          {
            id: "gobd",
            label: "GoBD-konformer Export",
            maxPoints: 20,
            earnedPoints: hasDatev ? 20 : 0,
            status: hasDatev ? "pass" : "warn",
            detail: hasDatev
              ? "DATEV-Export mit Prüfsumme (SHA-256) protokolliert."
              : "Noch kein GoBD-Export durchgeführt.",
            hint: hasDatev ? undefined : "Führen Sie einen DATEV-Export durch.",
          },
          {
            id: "audit",
            label: "Audit-Trail lückenlos",
            maxPoints: 20,
            earnedPoints: auditTotal > 0 ? 20 : 0,
            status: auditTotal > 0 ? "pass" : "fail",
            detail:
              auditTotal > 0
                ? `${auditTotal} Events${earliest ? `, lückenlos seit ${dateDE(earliest)}` : ""}.`
                : "Keine Audit-Ereignisse vorhanden.",
          },
          {
            id: "freigabe",
            label: "Freigabe-Workflow aktiv",
            maxPoints: 15,
            earnedPoints: freigabeAktiv ? 15 : 0,
            status: freigabeAktiv ? "pass" : "warn",
            detail: freigabeAktiv
              ? `Stufen konfiguriert (bis ${s.freigabe.stufe1} € / bis ${s.freigabe.stufe2} €).`
              : "Freigabe-Stufen nicht vollständig konfiguriert.",
            hint: freigabeAktiv ? undefined : "In den Einstellungen Freigabe-Regeln festlegen.",
            action: freigabeAktiv ? undefined : "fields",
          },
          {
            id: "par14",
            label: "§14 UStG-Prüfung",
            maxPoints: 15,
            earnedPoints: invoiceCount > 0 ? 15 : 0,
            status: invoiceCount > 0 ? "pass" : "warn",
            detail:
              invoiceCount > 0
                ? "Alle verarbeiteten Rechnungen werden automatisch gegen §14 UStG geprüft."
                : "Noch keine Rechnungen geprüft.",
          },
          {
            id: "aufbewahrung",
            label: "Aufbewahrungsfrist",
            maxPoints: 10,
            earnedPoints: 0,
            status: "warn",
            detail: "10-Jahres-Frist empfohlen — derzeit nicht explizit konfiguriert.",
            hint: "Aufbewahrungsrichtlinie dokumentieren (GoBD: 10 Jahre).",
          },
          {
            id: "dsgvo",
            label: "DSGVO-Löschkonzept",
            maxPoints: 10,
            earnedPoints: 0,
            status: "fail",
            detail: "Löschkonzept nicht konfiguriert.",
            hint: "DSGVO-Löschfristen und -prozess festlegen.",
          },
          {
            id: "sod",
            label: "Mehr-Augen-Prinzip (> 10.000 €)",
            maxPoints: 10,
            earnedPoints: multiAugen ? 10 : 0,
            status: multiAugen ? "pass" : "warn",
            detail: multiAugen
              ? `Eskalation ab ${s.freigabe.stufe2} € konfiguriert.`
              : "Keine Betragsgrenze für zusätzliche Freigabe.",
            hint: multiAugen ? undefined : "Zweite Freigabestufe für hohe Beträge aktivieren.",
          },
        ];

        const score = Math.min(100, checks.reduce((sum, c) => sum + c.earnedPoints, 0));
        const tier = score >= 90 ? "high" : score >= 70 ? "medium" : "low";
        setResult({ score, tier, checks });
        setEvents(audit.items.slice(0, 5));
        setError(null);
      })
      .catch(() => setError("Compliance-Status konnte nicht ermittelt werden."))
      .finally(() => setLoading(false));
  }, []);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    void load();
  }, [load]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <LoadingState label="Compliance-Status wird ermittelt …" />;
  if (error || !result) {
    return (
      <div className="fc-fade-in">
        <PageHeader title="Compliance-Center" description="Sind Sie prüfungssicher?" />
        <ErrorState message={error || "Keine Daten."} onRetry={retry} />
      </div>
    );
  }

  return (
    <div className="fc-fade-in">
      <PageHeader
        title="Compliance-Center"
        description="Prüfungsbereitschaft Ihres Unternehmens"
        action={
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-[rgba(0,56,86,0.12)] px-5 py-2.5 font-medium text-[#003856] transition-all hover:bg-[#faf9f7] active:scale-95 print:hidden"
          >
            <Printer className="h-4 w-4" />
            Compliance-Bericht herunterladen
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`${CARD} flex flex-col items-center justify-center lg:col-span-1`}>
          <ConfidenceRing result={result} size={150} />
          <p className="mt-3 text-center text-sm text-[#64748b]">Compliance-Score</p>
        </div>
        <div className="lg:col-span-2">
          <ConfidenceBreakdown result={result} title="Prüfungsbereitschaft" />
        </div>
      </div>

      {/* Letzte Prüfereignisse */}
      <div className={`${CARD} mt-6`}>
        <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Letzte Prüfereignisse</h2>
        {events.length === 0 ? (
          <p className="text-sm text-[#64748b]">Noch keine Ereignisse.</p>
        ) : (
          <ul className="space-y-3">
            {events.map((e) => {
              const meta = eventMeta(e.aktion);
              const Icon = meta.icon;
              return (
                <li key={e.id} className="flex items-start gap-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.ring} ${meta.cls}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#1a1a2e]">{e.aktion}</p>
                      <span className="text-xs text-[#94a3b8]">{dateDE(e.zeitpunkt, true)}</span>
                    </div>
                    {e.details && <p className="text-sm text-[#64748b]">{e.details}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
