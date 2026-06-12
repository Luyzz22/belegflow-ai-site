"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ArrowLeft, Building2, FileText, Sigma, Wallet } from "lucide-react";
import { flowcheckApi, ApiError, type LieferantDetail, type InvoiceListItem } from "@/lib/api-client";
import { eur, num, dateDE } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import { LoadingState, ErrorState } from "@/components/States";

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return `${MONTHS[Number(m) - 1] ?? m} ${y.slice(2)}`;
}

const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";

function StatCard({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
  return (
    <div className={CARD}>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#003856]/5 text-[#003856]">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[#64748b]">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-[#1a1a2e]">{value}</p>
    </div>
  );
}

export default function LieferantDetailPage() {
  const params = useParams<{ name: string }>();
  const name = params?.name ? decodeURIComponent(params.name) : "";

  const [data, setData] = useState<LieferantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!name) return;
    flowcheckApi
      .lieferant(name)
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Lieferant konnte nicht geladen werden."))
      .finally(() => setLoading(false));
  }, [name]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    void load();
  }, [load]);

  useEffect(() => {
    void load();
  }, [load]);

  const rechnungen: InvoiceListItem[] = useMemo(() => data?.rechnungen ?? [], [data]);

  const stats = useMemo(() => {
    const anzahl = rechnungen.length;
    const volumen = rechnungen.reduce((s, r) => s + (r.betrag || 0), 0);
    return { anzahl, volumen, schnitt: anzahl > 0 ? volumen / anzahl : 0 };
  }, [rechnungen]);

  const byMonth = useMemo(() => {
    const m = new Map<string, number>();
    rechnungen.forEach((r) => {
      const d = r.datum || r.created_at;
      if (!d || d.length < 7) return;
      const key = d.slice(0, 7);
      m.set(key, (m.get(key) || 0) + (r.betrag || 0));
    });
    return [...m.keys()]
      .sort()
      .slice(-6)
      .map((k) => ({ monat: monthLabel(k), volumen: m.get(k) || 0 }));
  }, [rechnungen]);

  const BackLink = (
    <Link
      href="/lieferanten"
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#64748b] transition hover:text-[#003856]"
    >
      <ArrowLeft className="h-4 w-4" />
      Zurück zu Lieferanten
    </Link>
  );

  if (loading) return <LoadingState label="Lieferant wird geladen …" />;
  if (error || !data) {
    return (
      <div className="fc-fade-in">
        {BackLink}
        <ErrorState message={error || "Lieferant nicht gefunden."} onRetry={retry} />
      </div>
    );
  }

  const recent = rechnungen.slice().sort((a, b) => (b.datum || "").localeCompare(a.datum || ""));

  return (
    <div className="fc-fade-in">
      {BackLink}

      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#003856] text-white">
          <Building2 className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1a1a2e]">{data.name}</h1>
          <p className="text-sm text-[#64748b]">Lieferanten-Übersicht</p>
        </div>
      </div>

      {/* Kennzahlen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Wallet} label="Gesamt-Volumen" value={eur(stats.volumen)} />
        <StatCard icon={FileText} label="Anzahl Rechnungen" value={num(stats.anzahl)} />
        <StatCard icon={Sigma} label="⌀ Rechnungsbetrag" value={eur(stats.schnitt)} />
      </div>

      {/* Volumen-Trend */}
      <div className={`${CARD} mt-6`}>
        <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Volumen (letzte 6 Monate)</h2>
        {byMonth.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#64748b]">Keine Verlaufsdaten verfügbar.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMonth} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ede7df" vertical={false} />
                <XAxis dataKey="monat" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={{ stroke: "#e7e0d6" }} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e7e0d6", fontSize: 12 }}
                  formatter={(v: number) => [eur(v), "Volumen"]}
                  cursor={{ fill: "rgba(0,56,86,0.04)" }}
                />
                <Bar dataKey="volumen" fill="#003856" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Rechnungshistorie */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold text-[#1a1a2e]">Rechnungshistorie</h2>
        </div>
        {recent.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-[#64748b]">Keine Rechnungen vorhanden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-[rgba(0,56,86,0.06)] text-left text-xs font-medium uppercase tracking-wider text-[#64748b]">
                  <th className="px-6 py-3">Datum</th>
                  <th className="px-6 py-3">Rechnungsnr.</th>
                  <th className="px-6 py-3 text-right">Betrag</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,56,86,0.06)]">
                {recent.map((r) => (
                  <tr key={r.id} className="transition hover:bg-[#faf9f7]">
                    <td className="whitespace-nowrap px-6 py-3.5 text-[#64748b]">{dateDE(r.datum)}</td>
                    <td className="px-6 py-3.5">
                      <Link href={`/rechnungen/${r.id}`} className="font-medium text-[#1a1a2e] hover:text-[#003856]">
                        {r.rechnungsnummer || `#${r.id}`}
                      </Link>
                    </td>
                    <td className="px-6 py-3.5 text-right font-medium tabular-nums text-[#1a1a2e]">
                      {eur(r.betrag, r.waehrung)}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>
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
