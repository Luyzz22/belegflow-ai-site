"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FileText,
  Gauge,
  Clock,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Inbox,
  Building2,
  Activity,
} from "lucide-react";
import {
  flowcheckApi,
  ApiError,
  type DashboardKpis,
  type InvoiceListItem,
  type InvoiceStatus,
  type Lieferant,
} from "@/lib/api-client";
import { eur, num, dateDE } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import CountUp from "@/components/CountUp";
import { ErrorState, EmptyState, CardSkeleton, Skeleton } from "@/components/States";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return "Guten Morgen";
  if (h < 18) return "Guten Tag";
  return "Guten Abend";
}

/** Relative Zeitangabe — wird beim Laden berechnet (nicht im Render). */
function relativeTime(iso: string, now: number): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const diffMin = Math.floor(Math.max(0, now - t) / 60_000);
  if (diffMin < 1) return "gerade eben";
  if (diffMin < 60) return `vor ${diffMin} Min`;
  const diffStd = Math.floor(diffMin / 60);
  if (diffStd < 24) return `vor ${diffStd} Std`;
  const diffTage = Math.floor(diffStd / 24);
  return diffTage === 1 ? "vor 1 Tag" : `vor ${diffTage} Tagen`;
}

const STATUS_META: Record<InvoiceStatus, { label: string; color: string }> = {
  neu: { label: "Neu", color: "#3b82f6" },
  verarbeitet: { label: "Verarbeitet", color: "#f59e0b" },
  freigegeben: { label: "Freigegeben", color: "#059669" },
  exportiert: { label: "Exportiert", color: "#94a3b8" },
};
const STATUS_ORDER: InvoiceStatus[] = ["neu", "verarbeitet", "freigegeben", "exportiert"];

interface ActivityItem {
  id: number;
  aktion: string;
  details: string;
  benutzer: string;
  rel: string;
}

/** Mini-Sparkline als normalisierte SVG-Polyline (ohne Achsen). */
function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 26 - ((v - min) / range) * 24;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="h-8 w-full" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="#003856"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  badge,
  progress,
  sub,
  extra,
}: {
  label: string;
  value: React.ReactNode;
  icon: typeof FileText;
  trend?: string;
  badge?: { text: string; cls: string };
  progress?: number;
  sub?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="fc-lift rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)] transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#003856]/5 text-[#003856]">
          <Icon className="h-5 w-5" />
        </span>
        {badge && (
          <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${badge.cls}`}>{badge.text}</span>
        )}
        {trend && !badge && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <TrendingUp className="h-3.5 w-3.5" />
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[#64748b]">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-[#1a1a2e]">{value}</p>
      {extra}
      {typeof progress === "number" && (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#003856]/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#003856] to-[#c8985a] transition-[width] duration-500"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      )}
      {sub && <p className="mt-2 text-xs text-[#64748b]">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [invoices, setInvoices] = useState<InvoiceListItem[] | null>(null);
  const [topLieferanten, setTopLieferanten] = useState<Lieferant[] | null>(null);
  const [activity, setActivity] = useState<ActivityItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([
      flowcheckApi.kpis(),
      flowcheckApi
        .invoices("limit=200&offset=0")
        .then((r) => r.items)
        .catch(() => [] as InvoiceListItem[]),
      flowcheckApi
        .lieferanten()
        .then((r) => r.items)
        .catch(() => [] as Lieferant[]),
      flowcheckApi
        .audit("limit=5&offset=0")
        .then((r) => r.items)
        .catch(() => []),
    ])
      .then(([k, inv, lief, audit]) => {
        const now = Date.now();
        setKpis(k);
        setInvoices(inv);
        setTopLieferanten(
          [...lief].sort((a, b) => b.gesamtvolumen - a.gesamtvolumen).slice(0, 5)
        );
        setActivity(
          audit.slice(0, 5).map((a) => ({
            id: a.id,
            aktion: a.aktion,
            details: a.details,
            benutzer: a.benutzer,
            rel: relativeTime(a.zeitpunkt, now),
          }))
        );
        setError(null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Daten konnten nicht geladen werden."))
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

  // ── Abgeleitete Daten (reine Berechnungen) ──────────────────────────
  const trend = useMemo(() => kpis?.trend ?? [], [kpis]);

  const week = useMemo(() => {
    const values = trend.map((t) => t.anzahl);
    const last7 = values.slice(-7);
    const prev7 = values.slice(-14, -7);
    const sumLast = last7.reduce((s, v) => s + v, 0);
    const sumPrev = prev7.reduce((s, v) => s + v, 0);
    const up = sumLast >= sumPrev;
    const pct = prev7.length > 0 && sumPrev > 0 ? ((sumLast - sumPrev) / sumPrev) * 100 : null;
    return { last7, up, pct };
  }, [trend]);

  const statusCounts = useMemo(() => {
    const counts: Record<InvoiceStatus, number> = {
      neu: 0,
      verarbeitet: 0,
      freigegeben: 0,
      exportiert: 0,
    };
    for (const inv of invoices ?? []) {
      if (inv.status in counts) counts[inv.status] += 1;
    }
    return counts;
  }, [invoices]);

  const donutData = useMemo(
    () =>
      STATUS_ORDER.map((s) => ({
        status: s,
        label: STATUS_META[s].label,
        color: STATUS_META[s].color,
        count: statusCounts[s],
      })).filter((d) => d.count > 0),
    [statusCounts]
  );
  const donutTotal = donutData.reduce((s, d) => s + d.count, 0);

  const recent = useMemo(() => (invoices ?? []).slice(0, 5), [invoices]);
  const maxVolumen = Math.max(1, ...(topLieferanten ?? []).map((l) => l.gesamtvolumen));

  const firstName = (user?.name || "").split(" ")[0];
  const header = (
    <PageHeader
      title={`${greeting()}${firstName ? `, ${firstName}` : ""}`}
      description="Überblick über Ihre Rechnungsverarbeitung"
    />
  );

  if (loading && !kpis) {
    return (
      <div className="fc-fade-in">
        {header}
        <CardSkeleton count={4} />
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-72 w-full rounded-2xl lg:col-span-2" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error && !kpis) {
    return (
      <div className="fc-fade-in">
        {header}
        <ErrorState message={error} onRetry={retry} />
      </div>
    );
  }

  const dringend = kpis?.aelteste_freigabe_stunden != null && kpis.aelteste_freigabe_stunden > 48;

  return (
    <div className="fc-fade-in">
      {header}

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Rechnungen diesen Monat"
          value={<CountUp value={kpis?.rechnungen_monat ?? 0} />}
          icon={FileText}
          trend={(kpis?.rechnungen_heute ?? 0) > 0 ? `+${num(kpis?.rechnungen_heute ?? 0)} heute` : undefined}
          sub={(kpis?.rechnungen_heute ?? 0) === 0 ? "Heute noch keine neuen" : undefined}
          extra={
            week.last7.length >= 2 ? (
              <div className="mt-3">
                <Sparkline values={week.last7} />
                <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium">
                  {week.up ? (
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                  )}
                  {week.pct != null && (
                    <span className={week.up ? "text-emerald-600" : "text-red-600"}>
                      {week.pct >= 0 ? "+" : ""}
                      {week.pct.toFixed(1).replace(".", ",")} %
                    </span>
                  )}
                  <span className="text-[#64748b]">vs. Vorwoche</span>
                </div>
              </div>
            ) : undefined
          }
        />
        <KpiCard
          label="Automatisierungsquote"
          value={
            <CountUp
              value={kpis?.automatisierungsquote ?? 0}
              format={(n) => `${Math.round(n)}%`}
            />
          }
          icon={Gauge}
          progress={kpis?.automatisierungsquote ?? 0}
        />
        <KpiCard
          label="Offene Freigaben"
          value={<CountUp value={kpis?.offene_freigaben ?? 0} />}
          icon={Clock}
          badge={dringend ? { text: "dringend", cls: "bg-red-50 text-red-700" } : undefined}
          sub={
            kpis?.aelteste_freigabe_stunden != null
              ? `Älteste: ${Math.round(kpis.aelteste_freigabe_stunden)} h`
              : "Keine offenen Freigaben"
          }
        />
        <KpiCard
          label="Anomalie-Alerts"
          value={<CountUp value={kpis?.anomalie_alerts ?? 0} />}
          icon={ShieldAlert}
          badge={
            (kpis?.anomalie_alerts ?? 0) > 0
              ? { text: "prüfen", cls: "bg-amber-50 text-amber-700" }
              : { text: "ok", cls: "bg-emerald-50 text-emerald-700" }
          }
        />
      </div>

      {/* Chart + volume */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="fc-lift rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)] lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#1a1a2e]">30-Tage-Verlauf</h2>
            <span className="text-xs font-medium uppercase tracking-wider text-[#64748b]">Verarbeitungsvolumen</span>
          </div>
          {trend.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-[#64748b]">
              Noch keine Verlaufsdaten
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fcArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#003856" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#003856" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ede7df" vertical={false} />
                  <XAxis
                    dataKey="datum"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickFormatter={(v) => dateDE(v).slice(0, 5)}
                    tickLine={false}
                    axisLine={{ stroke: "#e7e0d6" }}
                    minTickGap={24}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e7e0d6", fontSize: 12 }}
                    labelFormatter={(v) => dateDE(String(v))}
                    formatter={(v: number) => [num(v), "Rechnungen"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="anzahl"
                    stroke="#003856"
                    strokeWidth={2.5}
                    fill="url(#fcArea)"
                    activeDot={{ r: 5, fill: "#c8985a", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="fc-lift rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
          <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Volumen</h2>
          <dl className="space-y-4">
            {[
              ["Heute", kpis?.rechnungen_heute ?? 0],
              ["Diesen Monat", kpis?.rechnungen_monat ?? 0],
              ["Dieses Quartal", kpis?.rechnungen_quartal ?? 0],
            ].map(([label, val]) => (
              <div
                key={label as string}
                className="flex items-center justify-between border-b border-[rgba(0,56,86,0.06)] pb-3 last:border-0 last:pb-0"
              >
                <dt className="text-sm text-[#64748b]">{label}</dt>
                <dd className="text-lg font-semibold text-[#003856]">{num(val as number)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Donut | Top-Lieferanten | Aktivität */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Rechnungen nach Status */}
        <div className="fc-lift rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
          <h2 className="mb-2 text-xl font-semibold text-[#1a1a2e]">Rechnungen nach Status</h2>
          {donutTotal === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#003856]/5 text-[#003856]">
                <Inbox className="h-5 w-5" />
              </span>
              <p className="text-sm font-medium text-[#1a1a2e]">Noch keine Rechnungen</p>
              <p className="text-xs text-[#64748b]">Die Statusverteilung erscheint nach dem ersten Upload.</p>
            </div>
          ) : (
            <>
              <div className="relative h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={donutData}
                      dataKey="count"
                      nameKey="label"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {donutData.map((d) => (
                        <Cell
                          key={d.status}
                          fill={d.color}
                          cursor="pointer"
                          onClick={() => router.push(`/rechnungen?status=${d.status}`)}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid #e7e0d6", fontSize: 12 }}
                      formatter={(v: number) => [num(v), "Rechnungen"]}
                    />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold tracking-tight text-[#1a1a2e]">{num(donutTotal)}</span>
                  <span className="text-xs font-medium uppercase tracking-wider text-[#64748b]">Gesamt</span>
                </div>
              </div>
              <ul className="mt-4 space-y-1">
                {STATUS_ORDER.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => router.push(`/rechnungen?status=${s}`)}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition hover:bg-[#faf9f7]"
                    >
                      <span className="flex items-center gap-2 text-[#1a1a2e]">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: STATUS_META[s].color }}
                        />
                        {STATUS_META[s].label}
                      </span>
                      <span className="font-semibold text-[#003856]">{num(statusCounts[s])}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Top-Lieferanten */}
        <div className="fc-lift rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#1a1a2e]">Top-Lieferanten</h2>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#003856]/5 text-[#003856]">
              <Building2 className="h-4 w-4" />
            </span>
          </div>
          {(topLieferanten ?? []).length === 0 ? (
            <div className="flex h-56 items-center justify-center text-sm text-[#64748b]">
              Noch keine Lieferanten.
            </div>
          ) : (
            <ul className="space-y-4">
              {(topLieferanten ?? []).map((l) => (
                <li key={l.name}>
                  <button
                    type="button"
                    onClick={() => router.push("/lieferanten")}
                    className="group w-full rounded-lg px-2 py-1.5 text-left transition hover:bg-[#faf9f7]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-medium text-[#1a1a2e] group-hover:text-[#003856]">
                        {l.name}
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-[#003856]">
                        {eur(l.gesamtvolumen)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#003856]/5">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#003856] to-[#c8985a] transition-[width] duration-700 ease-out"
                        style={{ width: `${Math.max(2, (l.gesamtvolumen / maxVolumen) * 100)}%` }}
                      />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Letzte Aktivität */}
        <div className="fc-lift rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#1a1a2e]">Letzte Aktivität</h2>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#003856]/5 text-[#003856]">
              <Activity className="h-4 w-4" />
            </span>
          </div>
          {(activity ?? []).length === 0 ? (
            <div className="flex h-56 items-center justify-center text-sm text-[#64748b]">
              Noch keine Ereignisse.
            </div>
          ) : (
            <ol className="relative space-y-4">
              {(activity ?? []).map((a, i) => (
                <li key={a.id} className="relative flex gap-3 pl-1">
                  <span className="relative flex flex-col items-center">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#c8985a] ring-4 ring-[#c8985a]/15" />
                    {i < (activity ?? []).length - 1 && (
                      <span className="mt-1 w-px flex-1 bg-[rgba(0,56,86,0.1)]" />
                    )}
                  </span>
                  <div className="min-w-0 pb-1">
                    <p className="truncate text-sm font-medium text-[#1a1a2e]">{a.aktion}</p>
                    {a.details && <p className="truncate text-xs text-[#64748b]">{a.details}</p>}
                    <p className="mt-0.5 text-xs text-[#94a3b8]">
                      {a.benutzer ? `${a.benutzer} · ` : ""}
                      {a.rel}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Recent invoices */}
      <div className="fc-lift mt-6 overflow-hidden rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-xl font-semibold text-[#1a1a2e]">Letzte Rechnungen</h2>
          <Link
            href="/rechnungen"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#003856] transition hover:gap-2"
          >
            Alle ansehen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {invoices && invoices.length === 0 ? (
          <div className="px-6 pb-6">
            <EmptyState
              icon={<Inbox className="h-6 w-6" />}
              title="Noch keine Rechnungen"
              description="Laden Sie Ihre erste Rechnung hoch, um loszulegen."
              action={
                <Link
                  href="/upload"
                  className="rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#002a42]"
                >
                  Rechnung hochladen
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-[rgba(0,56,86,0.06)] text-left text-xs font-medium uppercase tracking-wider text-[#64748b]">
                  <th className="px-6 py-2.5">Lieferant</th>
                  <th className="px-6 py-2.5">Betrag</th>
                  <th className="px-6 py-2.5">Status</th>
                  <th className="px-6 py-2.5">Datum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,56,86,0.06)]">
                {recent.map((inv) => (
                  <tr key={inv.id} className="transition hover:bg-[#faf9f7]">
                    <td className="px-6 py-3">
                      <Link
                        href={`/rechnungen/${inv.id}`}
                        className="font-medium text-[#1a1a2e] hover:text-[#003856]"
                      >
                        {inv.lieferant || "—"}
                      </Link>
                      <p className="text-xs text-[#64748b]">{inv.rechnungsnummer}</p>
                    </td>
                    <td className="px-6 py-3 font-medium text-[#1a1a2e]">{eur(inv.betrag, inv.waehrung)}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-6 py-3 text-[#64748b]">{dateDE(inv.datum)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
