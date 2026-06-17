"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Droplets, Wallet, PiggyBank, CalendarClock, Zap } from "lucide-react";
import { flowcheckApi, ApiError, type InvoiceListItem } from "@/lib/api-client";
import { eur, dateDE } from "@/lib/format";
import { getPaidSet } from "@/lib/payments";
import { zahlungszielFor, getLieferantStamm } from "@/lib/stammdaten";
import PageHeader from "@/components/PageHeader";
import { LoadingState, ErrorState } from "@/components/States";

const DAY = 86_400_000;
const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";

interface Due {
  inv: InvoiceListItem;
  dueTs: number;
  skontoPct: number;
  skontoDeadlineTs: number | null;
}

function parseSkontoStr(s: string | undefined): { pct: number; days: number } | null {
  if (!s) return null;
  const pm = s.match(/(\d+(?:[.,]\d+)?)\s*%/);
  const tm = s.match(/(\d+)\s*tag/i);
  if (!pm || !tm) return null;
  return { pct: parseFloat(pm[1].replace(",", ".")), days: parseInt(tm[1], 10) };
}

function DarkKpi({ icon: Icon, label, value, sub }: { icon: typeof Wallet; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-[#003856] p-6 text-white shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#ffb900]">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-white/60">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className="mt-0.5 text-sm text-[#ffb900]">{sub}</p>}
    </div>
  );
}

export default function CashflowPage() {
  const [dues, setDues] = useState<Due[]>([]);
  const [now, setNow] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scenario, setScenario] = useState<"alle" | "skonto" | "pflicht">("alle");

  const load = useCallback(() => {
    flowcheckApi
      .invoices("limit=500&offset=0")
      .then((r) => {
        const paid = getPaidSet();
        const t = Date.now();
        const list: Due[] = (r.items || [])
          .filter((i) => !paid.has(i.id))
          .map((inv) => {
            const base = Date.parse(inv.datum || inv.created_at || "");
            const safeBase = Number.isFinite(base) ? base : t;
            const stamm = getLieferantStamm(inv.lieferant);
            const sk = parseSkontoStr(stamm.skonto);
            return {
              inv,
              dueTs: safeBase + zahlungszielFor(inv.lieferant) * DAY,
              skontoPct: sk?.pct ?? 0,
              skontoDeadlineTs: sk ? safeBase + sk.days * DAY : null,
            };
          });
        setDues(list);
        setNow(t);
        setError(null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Cash-Flow konnte nicht geladen werden."))
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

  const chartData = useMemo(() => {
    if (!now) return [];
    const buckets = Array.from({ length: 31 }, () => ({ faellig: 0, skonto: 0 }));
    dues.forEach((d) => {
      const off = Math.floor((d.dueTs - now) / DAY);
      if (off >= 0 && off <= 30) {
        buckets[off].faellig += d.inv.betrag || 0;
        if (d.skontoDeadlineTs && d.skontoDeadlineTs >= now) buckets[off].skonto += d.inv.betrag || 0;
      }
    });
    let cumF = 0;
    let cumS = 0;
    return buckets.map((b, i) => {
      cumF += b.faellig;
      cumS += b.skonto;
      return {
        tag: i === 0 ? "Heute" : `+${i}`,
        faellig: Math.round(cumF),
        skonto: Math.round(cumS),
      };
    });
  }, [dues, now]);

  const skontoDeadlineOffset = useMemo(() => {
    if (!now) return null;
    const upcoming = dues
      .filter((d) => d.skontoDeadlineTs && d.skontoDeadlineTs >= now && d.skontoPct > 0)
      .map((d) => Math.floor((d.skontoDeadlineTs! - now) / DAY))
      .filter((o) => o >= 0 && o <= 30)
      .sort((a, b) => a - b);
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [dues, now]);

  const kpis = useMemo(() => {
    const in7 = dues.filter((d) => d.dueTs - now <= 7 * DAY && d.dueTs >= now - 365 * DAY).reduce((s, d) => s + (d.inv.betrag || 0), 0);
    const in30 = dues.filter((d) => d.dueTs - now <= 30 * DAY && d.dueTs >= now - 365 * DAY).reduce((s, d) => s + (d.inv.betrag || 0), 0);
    const skontoPot = dues
      .filter((d) => d.skontoDeadlineTs && d.skontoDeadlineTs >= now && d.skontoPct > 0)
      .reduce((s, d) => s + (d.inv.betrag || 0) * (d.skontoPct / 100), 0);
    const dpo = dues.length > 0 ? Math.round(dues.reduce((s, d) => s + zahlungszielFor(d.inv.lieferant), 0) / dues.length) : 0;
    return { in7, in30, skontoPot, dpo };
  }, [dues, now]);

  // Wochen-Gruppierung für den Fälligkeitskalender.
  const weeks = useMemo(() => {
    if (!now) return [] as { label: string; sum: number; items: Due[] }[];
    const within = (from: number, to: number) =>
      dues.filter((d) => d.dueTs - now >= from * DAY && d.dueTs - now < to * DAY).sort((a, b) => a.dueTs - b.dueTs);
    const thisW = within(0, 7);
    const nextW = within(7, 14);
    const mk = (label: string, items: Due[]) => ({ label, sum: items.reduce((s, d) => s + (d.inv.betrag || 0), 0), items });
    return [mk("Diese Woche", thisW), mk("Nächste Woche", nextW)].filter((w) => w.items.length > 0);
  }, [dues, now]);

  const scenarioInfo = useMemo(() => {
    const thisWeek = dues.filter((d) => d.dueTs - now < 7 * DAY);
    const sum = thisWeek.reduce((s, d) => s + (d.inv.betrag || 0), 0);
    const pflicht = thisWeek.filter((d) => d.dueTs < now).reduce((s, d) => s + (d.inv.betrag || 0), 0);
    if (scenario === "skonto") return `Sie sparen ${eur(kpis.skontoPot)} und benötigen ${eur(sum)} diese Woche.`;
    if (scenario === "pflicht") return `Nur überfällige Zahlungen: ${eur(pflicht)} diese Woche nötig.`;
    return `Alle Fälligkeiten dieser Woche: ${eur(sum)}.`;
  }, [scenario, dues, now, kpis.skontoPot]);

  if (loading) return <LoadingState label="Cash-Flow wird berechnet …" />;
  if (error) {
    return (
      <div className="fc-fade-in">
        <PageHeader title="Cash Flow" description="Liquiditätsplanung" />
        <ErrorState message={error} onRetry={retry} />
      </div>
    );
  }

  return (
    <div className="fc-fade-in">
      <PageHeader title="Cash Flow" description="30-Tage-Liquiditätsprognose & Fälligkeiten" />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DarkKpi icon={Wallet} label="Fällig in 7 Tagen" value={eur(kpis.in7)} />
        <DarkKpi icon={CalendarClock} label="Fällig in 30 Tagen" value={eur(kpis.in30)} />
        <DarkKpi icon={PiggyBank} label="Skonto-Potenzial" value={eur(kpis.skontoPot)} sub="bei Zahlung in Frist" />
        <DarkKpi icon={Droplets} label="Ø Zahlungsziel" value={`${kpis.dpo} Tage`} />
      </div>

      {/* Prognose-Chart */}
      <div className={`${CARD} mt-6`}>
        <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">30-Tage-Prognose</h2>
        {chartData.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#64748b]">Keine offenen Fälligkeiten.</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="cfRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cfGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ede7df" vertical={false} />
                <XAxis dataKey="tag" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={{ stroke: "#e7e0d6" }} minTickGap={20} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e7e0d6", fontSize: 12 }}
                  formatter={(v: number, n) => [eur(v), n === "faellig" ? "Verbindlichkeiten" : "davon Skonto-fähig"]}
                />
                <Area type="monotone" dataKey="faellig" stroke="#dc2626" strokeWidth={2} fill="url(#cfRed)" />
                <Area type="monotone" dataKey="skonto" stroke="#059669" strokeWidth={2} fill="url(#cfGreen)" />
                {skontoDeadlineOffset != null && (
                  <ReferenceLine
                    x={skontoDeadlineOffset === 0 ? "Heute" : `+${skontoDeadlineOffset}`}
                    stroke="#c8985a"
                    strokeDasharray="4 4"
                    label={{ value: "Skonto-Frist", fontSize: 10, fill: "#8a6526", position: "top" }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#64748b]">
          <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 bg-[#dc2626]" />Fällige Verbindlichkeiten</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 bg-[#059669]" />Davon Skonto-fähig</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Fälligkeitskalender */}
        <div className={CARD}>
          <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Fälligkeitskalender</h2>
          {weeks.length === 0 ? (
            <p className="text-sm text-[#64748b]">In den nächsten zwei Wochen sind keine Zahlungen fällig.</p>
          ) : (
            <div className="space-y-5">
              {weeks.map((w) => (
                <div key={w.label}>
                  <p className="mb-2 text-sm font-semibold text-[#1a1a2e]">
                    {w.label}: <span className="text-[#003856]">{eur(w.sum)}</span> fällig
                  </p>
                  <ul className="space-y-1.5">
                    {w.items.map((d) => (
                      <li key={d.inv.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate text-[#1a1a2e]">
                          {d.inv.lieferant}
                          {d.skontoDeadlineTs && d.skontoDeadlineTs >= now && d.skontoPct > 0 && (
                            <span className="ml-1 text-[#c8985a]" title="Skonto möglich">⚡</span>
                          )}
                        </span>
                        <span className="shrink-0 text-[#64748b]">
                          {dateDE(new Date(d.dueTs).toISOString())} · {eur(d.inv.betrag, d.inv.waehrung)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Szenario-Simulation */}
        <div className={CARD}>
          <h2 className="mb-1 text-xl font-semibold text-[#1a1a2e]">Szenario-Simulation</h2>
          <p className="mb-4 text-sm text-[#64748b]">Was wäre wenn …</p>
          <div className="flex flex-wrap gap-2">
            {([
              ["alle", "Alle Fälligkeiten"],
              ["skonto", "Alle Skonti nutzen"],
              ["pflicht", "Nur Pflicht-Zahlungen"],
            ] as const).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setScenario(v)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition active:scale-95 ${
                  scenario === v ? "bg-[#003856] text-white" : "bg-[#faf9f7] text-[#64748b] hover:bg-[#003856]/5 hover:text-[#003856]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#003856]/10 bg-[#003856]/5 px-4 py-3 text-sm text-[#003856]">
            <Zap className="mt-0.5 h-4 w-4 shrink-0 text-[#c8985a]" />
            {scenarioInfo}
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-[#94a3b8]">
        Fälligkeiten aus Rechnungsdatum + Zahlungsziel (Stammdaten, Standard 30 Tage). Skonto aus den
        Lieferanten-Stammdaten. Bereits als bezahlt markierte Rechnungen sind ausgenommen.
      </p>
    </div>
  );
}
