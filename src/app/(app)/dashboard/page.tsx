"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { flowcheckApi, type DashboardKpis, type InvoiceListItem } from "@/lib/api-client";
import { eur, num, dateDE } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { LoadingState, ErrorState, EmptyState, Skeleton } from "@/components/States";

function KpiCard({
  label,
  value,
  sub,
  badge,
  progress,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  badge?: { text: string; cls: string };
  progress?: number;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-stone-500">{label}</p>
        {badge && (
          <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${badge.cls}`}>
            {badge.text}
          </span>
        )}
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-[#003856]">{value}</p>
      {typeof progress === "number" && (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-[#c8985a]"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      )}
      {sub && <p className="mt-2 text-xs text-stone-500">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [recent, setRecent] = useState<InvoiceListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([
      flowcheckApi.kpis(),
      flowcheckApi.invoices("limit=5&offset=0").then((r) => r.items).catch(() => [] as InvoiceListItem[]),
    ])
      .then(([k, r]) => {
        setKpis(k);
        setRecent(r);
        setError(null);
      })
      .catch((e) => setError(e?.message || "Fehler beim Laden"))
      .finally(() => setLoading(false));
  }, []);

  const retry = () => {
    setLoading(true);
    setError(null);
    load();
  };

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !kpis) {
    return (
      <>
        <PageHeader title="Dashboard" description="Überblick über Ihre Rechnungsverarbeitung" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <LoadingState />
      </>
    );
  }

  if (error && !kpis) {
    return (
      <>
        <PageHeader title="Dashboard" description="Überblick über Ihre Rechnungsverarbeitung" />
        <ErrorState message={error} onRetry={retry} />
      </>
    );
  }

  const dringend =
    kpis?.aelteste_freigabe_stunden != null && kpis.aelteste_freigabe_stunden > 48;

  const trend = kpis?.trend ?? [];

  return (
    <div className="fc-fade-in">
      <PageHeader title="Dashboard" description="Überblick über Ihre Rechnungsverarbeitung" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Rechnungen diesen Monat"
          value={num(kpis?.rechnungen_monat ?? 0)}
          sub={
            <span className="inline-flex items-center gap-1 text-emerald-600">
              ▲ {num(kpis?.rechnungen_heute ?? 0)} heute
            </span>
          }
        />
        <KpiCard
          label="Automatisierungsquote"
          value={`${Math.round(kpis?.automatisierungsquote ?? 0)}%`}
          progress={kpis?.automatisierungsquote ?? 0}
        />
        <KpiCard
          label="Offene Freigaben"
          value={num(kpis?.offene_freigaben ?? 0)}
          badge={
            dringend
              ? { text: "dringend", cls: "bg-rose-50 text-rose-700 ring-1 ring-rose-200" }
              : undefined
          }
          sub={
            kpis?.aelteste_freigabe_stunden != null
              ? `Älteste: ${Math.round(kpis.aelteste_freigabe_stunden)} h`
              : "Keine offenen Freigaben"
          }
        />
        <KpiCard
          label="Anomalie-Alerts"
          value={num(kpis?.anomalie_alerts ?? 0)}
          badge={
            (kpis?.anomalie_alerts ?? 0) > 0
              ? { text: "prüfen", cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" }
              : { text: "ok", cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" }
          }
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Trend */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200/60 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-800">30-Tage-Verlauf</h2>
            <span className="text-xs text-stone-400">Verarbeitungsvolumen</span>
          </div>
          {trend.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-stone-400">
              Noch keine Verlaufsdaten
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
                  <XAxis
                    dataKey="datum"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickFormatter={(v) => dateDE(v).slice(0, 5)}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
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
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                    labelFormatter={(v) => dateDE(String(v))}
                    formatter={(v: number) => [num(v), "Rechnungen"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="anzahl"
                    stroke="#003856"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "#c8985a" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Quartal summary */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
          <h2 className="mb-4 text-sm font-semibold text-stone-800">Volumen</h2>
          <dl className="space-y-4">
            {[
              ["Heute", kpis?.rechnungen_heute ?? 0],
              ["Diesen Monat", kpis?.rechnungen_monat ?? 0],
              ["Dieses Quartal", kpis?.rechnungen_quartal ?? 0],
            ].map(([label, val]) => (
              <div key={label as string} className="flex items-center justify-between border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                <dt className="text-sm text-stone-500">{label}</dt>
                <dd className="text-lg font-semibold text-[#003856]">{num(val as number)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Recent invoices */}
      <div className="mt-6 rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/60">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-sm font-semibold text-stone-800">Letzte Rechnungen</h2>
          <Link href="/rechnungen" className="text-sm font-medium text-[#003856] hover:underline">
            Alle ansehen →
          </Link>
        </div>
        {recent && recent.length === 0 ? (
          <div className="px-5 pb-6">
            <EmptyState
              icon="📄"
              title="Noch keine Rechnungen"
              description="Laden Sie Ihre erste Rechnung hoch, um loszulegen."
              action={
                <Link
                  href="/upload"
                  className="rounded-xl bg-[#003856] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#002a42]"
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
                <tr className="border-y border-stone-100 text-left text-xs uppercase tracking-wide text-stone-400">
                  <th className="px-5 py-2.5 font-medium">Lieferant</th>
                  <th className="px-5 py-2.5 font-medium">Betrag</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium">Datum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(recent ?? []).map((inv) => (
                  <tr key={inv.id} className="transition hover:bg-stone-50">
                    <td className="px-5 py-3">
                      <Link href={`/rechnungen/${inv.id}`} className="font-medium text-stone-800 hover:text-[#003856]">
                        {inv.lieferant || "—"}
                      </Link>
                      <p className="text-xs text-stone-400">{inv.rechnungsnummer}</p>
                    </td>
                    <td className="px-5 py-3 font-medium text-stone-800">{eur(inv.betrag, inv.waehrung)}</td>
                    <td className="px-5 py-3"><StatusBadge status={inv.status} /></td>
                    <td className="px-5 py-3 text-stone-500">{dateDE(inv.datum)}</td>
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
