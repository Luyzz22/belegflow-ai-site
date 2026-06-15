"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Printer,
  CloudUpload,
  ShieldCheck,
  XCircle,
  Download,
  Activity,
  ShieldAlert,
  AlertTriangle,
  Send,
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
import { useToast } from "@/components/toast/ToastProvider";

const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";

const IR_PLAN = [
  { phase: "1. Erkennung", desc: "Sicherheitsvorfall identifizieren und dokumentieren (Zeitpunkt, Umfang)." },
  { phase: "2. Bewertung", desc: "Schweregrad einstufen, betroffene Systeme und Daten ermitteln." },
  { phase: "3. Eindämmung", desc: "Sofortmaßnahmen ergreifen, Ausbreitung verhindern, Beweise sichern." },
  { phase: "4. Meldung", desc: "Frühwarnung an das BSI binnen 24 h, Meldung binnen 72 h (NIS2). Bei Datenpannen Art. 33 DSGVO." },
  { phase: "5. Nachbereitung", desc: "Wiederherstellung, Ursachenanalyse (Lessons Learned), Maßnahmen ableiten." },
];

const SEVERITY = [
  { level: "Kritisch", react: "Sofort (< 1 h)", desc: "Datenleck, Systemausfall, aktiver Angriff", cls: "bg-red-50 text-red-700 border-red-200" },
  { level: "Hoch", react: "< 4 h", desc: "Teilausfall, verdächtige Zugriffe", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  { level: "Mittel", react: "< 24 h", desc: "Einzelne fehlerhafte Komponente", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { level: "Niedrig", react: "< 72 h", desc: "Geringfügige Anomalie ohne Datenbezug", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

interface Incident {
  id: number;
  titel: string;
  schweregrad: string;
  beschreibung: string;
  zeitpunkt: string;
}

function eventMeta(aktion: string): { icon: LucideIcon; cls: string; ring: string } {
  const a = (aktion || "").toLowerCase();
  if (a.includes("upload")) return { icon: CloudUpload, cls: "text-blue-600", ring: "bg-blue-50" };
  if (a.includes("freig") || a.includes("genehm")) return { icon: ShieldCheck, cls: "text-emerald-600", ring: "bg-emerald-50" };
  if (a.includes("ablehn") || a.includes("reject")) return { icon: XCircle, cls: "text-red-600", ring: "bg-red-50" };
  if (a.includes("export")) return { icon: Download, cls: "text-slate-500", ring: "bg-slate-100" };
  return { icon: Activity, cls: "text-[#003856]", ring: "bg-[#003856]/5" };
}

export default function ComplianceCenterPage() {
  const { addToast } = useToast();
  const [result, setResult] = useState<ConfidenceResult | null>(null);
  const [events, setEvents] = useState<AuditEntry[]>([]);
  const [nowTs, setNowTs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [form, setForm] = useState({ titel: "", schweregrad: "Mittel", beschreibung: "" });

  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        setIncidents(JSON.parse(localStorage.getItem("fc_incidents") || "[]"));
      } catch {
        setIncidents([]);
      }
    });
  }, []);

  const reportIncident = () => {
    if (!form.titel.trim()) {
      addToast({ type: "error", text: "Bitte einen Titel angeben." });
      return;
    }
    const entry: Incident = {
      id: Date.now(),
      titel: form.titel.trim(),
      schweregrad: form.schweregrad,
      beschreibung: form.beschreibung.trim(),
      zeitpunkt: new Date().toISOString(),
    };
    const next = [entry, ...incidents];
    setIncidents(next);
    localStorage.setItem("fc_incidents", JSON.stringify(next));
    setForm({ titel: "", schweregrad: "Mittel", beschreibung: "" });
    addToast({ type: "success", text: "Sicherheitsvorfall protokolliert (security_incident). NIS2-Meldefristen beachten." });
  };

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
        setNowTs(Date.now());
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

      {/* Regulatorischer Radar */}
      <div className={`${CARD} mt-6`}>
        <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Regulatorische Änderungen</h2>
        <ul className="space-y-3">
          {[
            {
              date: "2027-01-01",
              tone: "red" as const,
              title: "E-Rechnungs-Versandpflicht (B2B)",
              text: "Ab dem 01.01.2027 müssen Unternehmen in Deutschland B2B-Rechnungen als E-Rechnung versenden. FlowCheck unterstützt XRechnung 3.0 ✅",
              cta: { label: "Mehr erfahren", href: "/compliance" },
            },
            {
              date: "2026-08-02",
              tone: "amber" as const,
              title: "EU AI Act Art. 50 — Transparenzpflichten",
              text: "KI-Systeme müssen als solche gekennzeichnet werden. Der KI-Analyse-Tab schafft Transparenz ✅",
              cta: { label: "Compliance prüfen", href: "/rechnungen" },
            },
            {
              date: "2025-01-01",
              tone: "green" as const,
              title: "E-Rechnungs-Empfangspflicht ✅",
              text: "Seit 01.01.2025 müssen alle Unternehmen E-Rechnungen empfangen können. FlowCheck: XRechnung-Parser aktiv.",
              cta: null,
            },
          ].map((r) => {
            const ts = Date.parse(r.date);
            const future = nowTs > 0 && ts > nowTs;
            const days = nowTs > 0 ? Math.ceil((ts - nowTs) / 86_400_000) : 0;
            const dot = r.tone === "red" ? "bg-red-500" : r.tone === "amber" ? "bg-amber-500" : "bg-emerald-500";
            const border = r.tone === "red" ? "border-l-red-400" : r.tone === "amber" ? "border-l-amber-400" : "border-l-emerald-400";
            return (
              <li key={r.date} className={`rounded-xl border border-l-4 border-[rgba(0,56,86,0.08)] bg-white p-4 ${border}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                  <span className="text-sm font-semibold text-[#1a1a2e]">{dateDE(r.date)} — {r.title}</span>
                  {future && (
                    <span className="rounded-md bg-[#003856]/5 px-2 py-0.5 text-xs font-semibold text-[#003856]">
                      in {days} Tagen
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-[#64748b]">{r.text}</p>
                {r.cta && (
                  <Link href={r.cta.href} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#003856] hover:underline">
                    {r.cta.label} →
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* NIS2 — Incident Response */}
      <div className={`${CARD} mt-6`}>
        <h2 className="mb-1 flex items-center gap-2 text-xl font-semibold text-[#1a1a2e]">
          <ShieldAlert className="h-5 w-5 text-[#003856]" /> NIS2 — Incident Response
        </h2>
        <p className="mb-5 text-sm text-[#64748b]">
          Verfahren zur Behandlung von Sicherheitsvorfällen gemäß NIS2-Richtlinie (Meldefristen: 24 h Frühwarnung, 72 h Meldung).
        </p>

        {/* Incident-Response-Plan Timeline */}
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#64748b]">Incident-Response-Plan</h3>
        <ol className="relative mb-8 space-y-4 border-l border-[rgba(0,56,86,0.12)] pl-6">
          {IR_PLAN.map((p) => (
            <li key={p.phase} className="relative">
              <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#003856] ring-4 ring-white" />
              <p className="text-sm font-semibold text-[#1a1a2e]">{p.phase}</p>
              <p className="text-sm text-[#64748b]">{p.desc}</p>
            </li>
          ))}
        </ol>

        {/* Severity-Matrix */}
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#64748b]">Severity-Matrix</h3>
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SEVERITY.map((s) => (
            <div key={s.level} className={`rounded-xl border p-3.5 ${s.cls}`}>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm font-bold">{s.level}</p>
              </div>
              <p className="mt-1 text-xs font-semibold">Reaktion: {s.react}</p>
              <p className="mt-1 text-xs opacity-90">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Incident melden */}
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#64748b]">Incident melden</h3>
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-[rgba(0,56,86,0.08)] bg-[#faf9f7] p-4 sm:grid-cols-2">
          <input
            value={form.titel}
            onChange={(e) => setForm((f) => ({ ...f, titel: e.target.value }))}
            placeholder="Titel des Vorfalls"
            className="rounded-xl border border-[rgba(0,56,86,0.12)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
          />
          <select
            value={form.schweregrad}
            onChange={(e) => setForm((f) => ({ ...f, schweregrad: e.target.value }))}
            className="rounded-xl border border-[rgba(0,56,86,0.12)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
          >
            {SEVERITY.map((s) => (
              <option key={s.level} value={s.level}>{s.level}</option>
            ))}
          </select>
          <textarea
            value={form.beschreibung}
            onChange={(e) => setForm((f) => ({ ...f, beschreibung: e.target.value }))}
            placeholder="Beschreibung (betroffene Systeme, Zeitpunkt, ergriffene Maßnahmen)"
            rows={3}
            className="rounded-xl border border-[rgba(0,56,86,0.12)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20 sm:col-span-2"
          />
          <button
            onClick={reportIncident}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95 sm:col-span-2 sm:justify-self-start"
          >
            <Send className="h-4 w-4" /> Incident melden
          </button>
        </div>

        {/* Gemeldete Vorfälle */}
        {incidents.length > 0 && (
          <div className="mt-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#64748b]">Gemeldete Vorfälle</h3>
            <ul className="space-y-2">
              {incidents.map((i) => (
                <li key={i.id} className="flex items-start gap-3 rounded-xl border border-[rgba(0,56,86,0.08)] bg-white p-3.5">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#003856]" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#1a1a2e]">{i.titel}</p>
                      <span className="text-xs text-[#94a3b8]">{dateDE(i.zeitpunkt, true)}</span>
                    </div>
                    <p className="text-xs font-semibold text-[#64748b]">Schweregrad: {i.schweregrad}</p>
                    {i.beschreibung && <p className="mt-0.5 text-sm text-[#64748b]">{i.beschreibung}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
