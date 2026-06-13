"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Inbox,
  Sparkles,
  ShieldCheck,
  Check,
  Landmark,
  CreditCard,
  ArrowRight,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { flowcheckApi, ApiError, type InvoiceListItem, type DashboardKpis } from "@/lib/api-client";
import { num } from "@/lib/format";
import { getPaidSet } from "@/lib/payments";
import { getAccuracy } from "@/lib/kiFeedback";
import PageHeader from "@/components/PageHeader";
import { LoadingState, ErrorState } from "@/components/States";

const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";

interface Node {
  label: string;
  icon: LucideIcon;
  rate: number;
  wait: string | null;
  bottleneck: boolean;
}

export default function ProzessePage() {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [paidCount, setPaidCount] = useState(0);
  const [reviewAvg, setReviewAvg] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<{ pct: number; count: number }>({ pct: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([
      flowcheckApi.invoices("limit=500&offset=0").then((r) => r.items).catch(() => [] as InvoiceListItem[]),
      flowcheckApi.kpis().catch(() => null as DashboardKpis | null),
    ])
      .then(([items, k]) => {
        const paid = getPaidSet();
        setInvoices(items);
        setKpis(k);
        setPaidCount(items.filter((i) => paid.has(i.id)).length);
        setAccuracy(getAccuracy());
        if (typeof window !== "undefined") setReviewAvg(localStorage.getItem("flowcheck_review_avg"));
        setError(null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Prozessdaten konnten nicht geladen werden."))
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

  const total = invoices.length;
  const oldestH = kpis?.aelteste_freigabe_stunden ?? null;
  const quote = Math.round(kpis?.automatisierungsquote ?? 0);

  const nodes = useMemo<Node[]>(() => {
    const t = total || 1;
    const st = (i: InvoiceListItem) => (i.status || "").toLowerCase();
    const extrahiert = invoices.filter((i) => st(i) !== "neu").length;
    const freigegeben = invoices.filter((i) => ["freigegeben", "exportiert"].includes(st(i))).length;
    const exportiert = invoices.filter((i) => st(i) === "exportiert").length;
    const freigabeBottleneck = oldestH != null && oldestH > 24;
    return [
      { label: "Eingang", icon: Inbox, rate: 100, wait: "automatisch", bottleneck: false },
      { label: "Extraktion", icon: Sparkles, rate: Math.round((extrahiert / t) * 100), wait: "automatisch", bottleneck: false },
      { label: "Validierung", icon: ShieldCheck, rate: Math.round((extrahiert / t) * 100), wait: "automatisch", bottleneck: false },
      {
        label: "Freigabe",
        icon: Check,
        rate: Math.round((freigegeben / t) * 100),
        wait: oldestH != null ? `Ø Wartezeit: ${Math.round(oldestH)} h` : "manuell",
        bottleneck: freigabeBottleneck,
      },
      { label: "Export", icon: Landmark, rate: Math.round((exportiert / t) * 100), wait: "1 Klick", bottleneck: false },
      { label: "Zahlung", icon: CreditCard, rate: Math.round((paidCount / t) * 100), wait: null, bottleneck: false },
    ];
  }, [invoices, total, oldestH, paidCount]);

  const bottleneck = nodes.find((n) => n.bottleneck) ?? null;

  if (loading) return <LoadingState label="Prozessdaten werden geladen …" />;
  if (error) {
    return (
      <div className="fc-fade-in">
        <PageHeader title="Prozesse" description="Process Intelligence für Ihre Rechnungsverarbeitung" />
        <ErrorState message={error} onRetry={retry} />
      </div>
    );
  }

  const variants = [
    { label: "Happy Path", pct: quote, desc: "Eingang → Extraktion → Validierung → Freigabe → Export", color: "#059669" },
    { label: "Manueller Eingriff", pct: 100 - quote, desc: "… → manuelle Prüfung / Freigabe", color: "#d97706" },
  ];

  return (
    <div className="fc-fade-in">
      <PageHeader title="Prozesse" description="Process Intelligence — Durchlauf, Engpässe, Varianten" />

      {/* Prozess-Flow */}
      <div className={`${CARD} mb-6 overflow-x-auto`}>
        <h2 className="mb-5 text-xl font-semibold text-[#1a1a2e]">Prozess-Fluss</h2>
        <div className="flex min-w-[680px] items-start">
          {nodes.map((n, i) => {
            const Icon = n.icon;
            return (
              <Fragment key={n.label}>
                {i > 0 && (
                  <div className="mt-8 flex flex-1 flex-col items-center px-1">
                    <ArrowRight className="h-4 w-4 text-[#94a3b8]" />
                    <span className="mt-1 whitespace-nowrap text-[10px] text-[#94a3b8]">{n.rate}%</span>
                  </div>
                )}
                <div className="flex flex-col items-center text-center" style={{ minWidth: 84 }}>
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-xl border bg-white shadow-md ${
                      n.bottleneck ? "animate-pulse ring-2 ring-red-500" : "border-[rgba(0,56,86,0.1)]"
                    }`}
                    style={{ opacity: 0.5 + (n.rate / 100) * 0.5 }}
                  >
                    <Icon className={`h-6 w-6 ${n.bottleneck ? "text-red-600" : "text-[#003856]"}`} />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[#1a1a2e]">{n.label}</p>
                  <p className="text-xs text-[#64748b]">{n.rate}% erreicht</p>
                  {n.wait && <p className={`text-[11px] ${n.bottleneck ? "font-medium text-red-600" : "text-[#94a3b8]"}`}>{n.wait}</p>}
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* Engpass-Analyse */}
      {bottleneck && (
        <div className="mb-6 rounded-2xl border-l-4 border-red-400 bg-red-50 p-5">
          <p className="flex items-center gap-2 font-semibold text-red-800">
            <AlertTriangle className="h-5 w-5" /> Engpass erkannt: {bottleneck.label}-Schritt
          </p>
          {oldestH != null && (
            <p className="mt-1 text-sm text-red-700">Durchschnittliche Wartezeit: {Math.round(oldestH)} Stunden.</p>
          )}
          <p className="mt-1 text-sm text-red-700">
            Empfehlung: Aktivieren Sie die automatische Freigabe für kleine Beträge.
          </p>
          <Link href="/einstellungen" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-red-800 hover:underline">
            Einstellungen öffnen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Varianten */}
        <div className={CARD}>
          <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Varianten-Analyse</h2>
          <div className="space-y-4">
            {variants.map((v) => (
              <div key={v.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-[#1a1a2e]">
                    {v.label} ({v.pct}%)
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-[#003856]/5">
                  <div className="h-full rounded-full" style={{ width: `${Math.max(2, v.pct)}%`, background: v.color }} />
                </div>
                <p className="mt-1 text-xs text-[#64748b]">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Prozess-KPIs */}
        <div className={CARD}>
          <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Prozess-KPIs</h2>
          <dl className="grid grid-cols-2 gap-4">
            {[
              { label: "Straight-Through-Rate", value: `${quote}%`, sub: "ohne manuellen Eingriff" },
              { label: "First-Pass-Yield", value: accuracy.count > 0 ? `${accuracy.pct}%` : "—", sub: accuracy.count > 0 ? `${accuracy.count} bewertet` : "noch keine Bewertung" },
              { label: "⌀ Review-Zeit", value: reviewAvg ? `${reviewAvg} Sek.` : "—", sub: "pro Rechnung" },
              { label: "Offene Freigaben", value: num(kpis?.offene_freigaben ?? 0), sub: oldestH != null ? `älteste ${Math.round(oldestH)} h` : "" },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border border-[rgba(0,56,86,0.08)] bg-[#faf9f7] p-4">
                <dt className="text-xs font-medium uppercase tracking-wider text-[#64748b]">{k.label}</dt>
                <dd className="mt-1 text-2xl font-bold text-[#1a1a2e]">{k.value}</dd>
                {k.sub && <dd className="text-xs text-[#94a3b8]">{k.sub}</dd>}
              </div>
            ))}
          </dl>
        </div>
      </div>

      <p className="mt-4 text-xs text-[#94a3b8]">
        Durchlaufraten aus den tatsächlichen Rechnungs-Status berechnet. Wartezeiten, sofern vom Backend verfügbar
        (offene Freigaben). Schritt-Verarbeitungszeiten laufen automatisch.
      </p>
    </div>
  );
}
