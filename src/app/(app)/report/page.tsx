"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Printer, TrendingUp, TrendingDown, Sparkles, AlertTriangle, ShieldCheck } from "lucide-react";
import { flowcheckApi, type InvoiceListItem, type DashboardKpis, type Lieferant } from "@/lib/api-client";
import { eur, num } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { LoadingState, ErrorState } from "@/components/States";

const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";
const DAY = 86_400_000;
const AUTO_MIN = 0.75;

function isoWeek(d: Date): { week: number; year: number } {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week =
    1 + Math.round(((date.getTime() - firstThursday.getTime()) / DAY - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return { week, year: date.getUTCFullYear() };
}

interface Report {
  kw: string;
  thisWeek: number;
  pct: number | null;
  up: boolean;
  autoCount: number;
  manuell: number;
  quote: number;
  volumen: number;
  ersparnis: number;
  neuerLieferant: string | null;
  anomalien: number;
}

export default function ReportPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([
      flowcheckApi.invoices("limit=500&offset=0").then((r) => r.items).catch(() => [] as InvoiceListItem[]),
      flowcheckApi.kpis().catch(() => null as DashboardKpis | null),
      flowcheckApi.lieferanten().then((r) => r.items).catch(() => [] as Lieferant[]),
    ])
      .then(([items, kpis, lieferanten]) => {
        const now = Date.now();
        const inWindow = (iso: string, fromDaysAgo: number, toDaysAgo: number) => {
          const t = Date.parse(iso || "");
          if (!Number.isFinite(t)) return false;
          const age = (now - t) / DAY;
          return age >= toDaysAgo && age < fromDaysAgo;
        };
        const thisWeekItems = items.filter((i) => inWindow(i.datum || i.created_at, 7, 0));
        const lastWeekItems = items.filter((i) => inWindow(i.datum || i.created_at, 14, 7));
        const thisWeek = thisWeekItems.length;
        const lastWeek = lastWeekItems.length;
        const pct = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : null;
        const quote = Math.round(kpis?.automatisierungsquote ?? 0);
        const autoCount = Math.round((thisWeek * quote) / 100);
        const volumen = thisWeekItems.reduce((s, i) => s + (i.betrag || 0), 0);

        // Ersparnis-Schätzung aus ROI-Eingaben (Fallback: Defaults).
        let minManuell = 8;
        let stundensatz = 45;
        try {
          const raw = localStorage.getItem("flowcheck_roi");
          if (raw) {
            const r = JSON.parse(raw);
            minManuell = r.minManuell ?? 8;
            stundensatz = r.stundensatz ?? 45;
          }
        } catch {
          /* defaults */
        }
        const ersparnis = (thisWeek * ((minManuell - AUTO_MIN) / 60) * stundensatz);

        const neu = lieferanten.find((l) => l.anzahl_rechnungen <= 1);
        const { week, year } = isoWeek(new Date(now));

        setReport({
          kw: `KW ${week}/${year}`,
          thisWeek,
          pct,
          up: (pct ?? 0) >= 0,
          autoCount,
          manuell: thisWeek - autoCount,
          quote,
          volumen,
          ersparnis,
          neuerLieferant: neu?.name ?? null,
          anomalien: kpis?.anomalie_alerts ?? 0,
        });
        setError(null);
      })
      .catch(() => setError("Bericht konnte nicht erstellt werden."))
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

  if (loading) return <LoadingState label="Wochenbericht wird erstellt …" />;
  if (error || !report) {
    return (
      <div className="fc-fade-in">
        <PageHeader title="Wochenbericht" description="Executive Summary" />
        <ErrorState message={error || "Keine Daten."} onRetry={retry} />
      </div>
    );
  }

  const r = report;
  return (
    <div className="fc-fade-in">
      <PageHeader
        title={`Wochenbericht — ${r.kw}`}
        description="FlowCheck AI+ Executive Summary"
        action={
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-[rgba(0,56,86,0.12)] px-5 py-2.5 font-medium text-[#003856] transition-all hover:bg-[#faf9f7] active:scale-95 print:hidden"
          >
            <Printer className="h-4 w-4" />
            Als PDF herunterladen
          </button>
        }
      />

      {/* 1. Zusammenfassung */}
      <section className={CARD}>
        <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">1. Zusammenfassung</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#64748b]">Verarbeitet</p>
            <p className="mt-1 text-2xl font-bold text-[#1a1a2e]">{num(r.thisWeek)} Rechnungen</p>
            {r.pct !== null && (
              <p className={`mt-0.5 inline-flex items-center gap-1 text-sm ${r.up ? "text-emerald-600" : "text-red-600"}`}>
                {r.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {r.pct >= 0 ? "+" : ""}
                {Math.round(r.pct)}% vs. Vorwoche
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#64748b]">Automatisierung</p>
            <p className="mt-1 text-2xl font-bold text-[#1a1a2e]">{r.quote}%</p>
            <p className="mt-0.5 text-sm text-[#64748b]">{num(r.autoCount)} automatisch · {num(r.manuell)} manuell</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#64748b]">Gesamtvolumen</p>
            <p className="mt-1 text-2xl font-bold text-[#1a1a2e]">{eur(r.volumen)}</p>
            <p className="mt-0.5 text-sm text-emerald-600">~{eur(r.ersparnis)} Ersparnis (geschätzt)</p>
          </div>
        </div>
      </section>

      {/* 2. Top-Ereignisse */}
      <section className={`${CARD} mt-6`}>
        <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">2. Top-Ereignisse</h2>
        <ul className="space-y-2.5 text-sm">
          {r.neuerLieferant && (
            <li className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 shrink-0 text-emerald-600" />
              <span className="text-[#1a1a2e]">Neuer Lieferant: {r.neuerLieferant}</span>
            </li>
          )}
          {r.anomalien > 0 && (
            <li className="flex items-center gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              <span className="text-[#1a1a2e]">{num(r.anomalien)} Anomalie-Alert(s) zur Prüfung</span>
            </li>
          )}
          {!r.neuerLieferant && r.anomalien === 0 && (
            <li className="text-[#64748b]">Keine besonderen Ereignisse in dieser Woche.</li>
          )}
        </ul>
      </section>

      {/* 3. Compliance */}
      <section className={`${CARD} mt-6`}>
        <h2 className="mb-2 text-xl font-semibold text-[#1a1a2e]">3. Compliance-Status</h2>
        <p className="flex items-center gap-2 text-sm text-[#64748b]">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Detaillierter Status im{" "}
          <Link href="/compliance-center" className="font-medium text-[#003856] hover:underline print:no-underline">
            Compliance-Center
          </Link>
          .
        </p>
      </section>

      <p className="mt-4 text-xs text-[#94a3b8]">
        Automatisch generiert aus den Rechnungsdaten der letzten 7 Tage. Ersparnis-Schätzung basiert auf den
        ROI-Annahmen. Aufteilung automatisch/manuell abgeleitet aus der Automatisierungsquote.
      </p>
    </div>
  );
}
