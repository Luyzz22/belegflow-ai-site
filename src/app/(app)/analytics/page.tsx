"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Wallet, Receipt, Building2, Timer, Printer } from "lucide-react";
import { flowcheckApi, ApiError, type InvoiceListItem, type InvoiceDetail } from "@/lib/api-client";
import { eur, num } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { ErrorState, EmptyState, CardSkeleton, Skeleton } from "@/components/States";

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const PIE_COLORS = ["#003856", "#c8985a", "#0a4d70", "#d97706", "#059669"];
const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";

function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return `${MONTHS[Number(m) - 1] ?? m} ${y.slice(2)}`;
}

function DarkKpi({ icon: Icon, label, value }: { icon: typeof Wallet; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#003856] p-6 text-white shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#ffb900]">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-white/60">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [list, setList] = useState<InvoiceListItem[]>([]);
  const [details, setDetails] = useState<InvoiceDetail[]>([]);
  const [currentYear, setCurrentYear] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    flowcheckApi
      .invoices("limit=500&offset=0")
      .then((r) => {
        const items = r.items || [];
        return Promise.all(
          items.slice(0, 120).map((i) => flowcheckApi.invoice(i.id).catch(() => null))
        ).then((dets) => ({ items, details: dets.filter((d): d is InvoiceDetail => d !== null) }));
      })
      .then(({ items, details: dets }) => {
        setList(items);
        setDetails(dets);
        setCurrentYear(new Date().getFullYear());
        setError(null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Analytics konnten nicht geladen werden."))
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

  // ── KPIs ────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total = list.reduce((s, i) => s + (i.betrag || 0), 0);
    const yearTotal = list
      .filter((i) => (i.datum || "").slice(0, 4) === String(currentYear))
      .reduce((s, i) => s + (i.betrag || 0), 0);
    const lieferanten = new Set(list.map((i) => i.lieferant).filter(Boolean)).size;
    const avg = list.length ? total / list.length : 0;
    let bearbeitung = "—";
    if (typeof window !== "undefined") {
      const v = localStorage.getItem("flowcheck_review_avg");
      if (v) bearbeitung = `${v} Sek.`;
    }
    return { yearTotal, avg, lieferanten, bearbeitung };
  }, [list, currentYear]);

  // ── Monatliche Ausgaben (Netto + USt) + Vorjahresvergleich ──
  const monthly = useMemo(() => {
    const cur = new Map<string, { netto: number; ust: number }>();
    const prevByMonth = new Map<string, number>(); // YYYY-MM → Brutto
    details.forEach((d) => {
      const key = (d.datum || d.created_at || "").slice(0, 7);
      if (key.length < 7) return;
      const e = cur.get(key) || { netto: 0, ust: 0 };
      e.netto += d.netto || 0;
      e.ust += d.ust_betrag || 0;
      cur.set(key, e);
      prevByMonth.set(key, (prevByMonth.get(key) || 0) + (d.betrag || 0));
    });
    const keys = [...cur.keys()].sort().slice(-12);
    return keys.map((k) => {
      const [y, m] = k.split("-");
      const prevKey = `${Number(y) - 1}-${m}`;
      const e = cur.get(k)!;
      return {
        monat: monthLabel(k),
        netto: Math.round(e.netto),
        ust: Math.round(e.ust),
        vorjahr: Math.round(prevByMonth.get(prevKey) || 0),
      };
    });
  }, [details]);

  // ── Top 5 Lieferanten (nach Volumen) ──
  const topSuppliers = useMemo(() => {
    const m = new Map<string, number>();
    list.forEach((i) => m.set(i.lieferant || "—", (m.get(i.lieferant || "—") || 0) + (i.betrag || 0)));
    return [...m.entries()]
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [list]);

  // ── Ausgaben nach Kategorie (Kontierung-Konto) ──
  const categories = useMemo(() => {
    const m = new Map<string, number>();
    details.forEach((d) => {
      const konto = d.kontierung?.konto;
      if (!konto || konto === "-") return;
      m.set(konto, (m.get(konto) || 0) + (d.betrag || 0));
    });
    const arr = [...m.entries()].map(([konto, value]) => ({ konto, value: Math.round(value) }));
    arr.sort((a, b) => b.value - a.value);
    return arr.slice(0, 6);
  }, [details]);
  const maxCat = Math.max(1, ...categories.map((c) => c.value));

  // ── Status-Übersicht (Beträge) ──
  const statusData = useMemo(() => {
    const meta: Record<string, { label: string; color: string }> = {
      neu: { label: "Neu", color: "#3b82f6" },
      verarbeitet: { label: "Verarbeitet", color: "#f59e0b" },
      freigegeben: { label: "Freigegeben", color: "#059669" },
      exportiert: { label: "Exportiert", color: "#94a3b8" },
    };
    const m = new Map<string, number>();
    list.forEach((i) => {
      const s = (i.status || "").toLowerCase();
      if (s in meta) m.set(s, (m.get(s) || 0) + (i.betrag || 0));
    });
    return [...m.entries()]
      .map(([s, value]) => ({ label: meta[s].label, color: meta[s].color, value: Math.round(value) }))
      .filter((d) => d.value > 0);
  }, [list]);

  if (loading) {
    return (
      <div className="fc-fade-in">
        <PageHeader title="Analytics" description="Spend Analytics für Finance-Teams" />
        <CardSkeleton count={4} />
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 w-full rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="fc-fade-in">
        <PageHeader title="Analytics" description="Spend Analytics für Finance-Teams" />
        <ErrorState message={error} onRetry={retry} />
      </div>
    );
  }
  if (list.length === 0) {
    return (
      <div className="fc-fade-in">
        <PageHeader title="Analytics" description="Spend Analytics für Finance-Teams" />
        <EmptyState title="Noch keine Auswertungsdaten" description="Sobald Rechnungen vorliegen, erscheinen hier Auswertungen." />
      </div>
    );
  }

  return (
    <div className="fc-fade-in">
      <PageHeader
        title="Analytics"
        description="Spend Analytics für Finance-Teams"
        action={
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-[rgba(0,56,86,0.12)] px-5 py-2.5 font-medium text-[#003856] transition-all hover:bg-[#faf9f7] active:scale-95"
          >
            <Printer className="h-4 w-4" />
            Als PDF herunterladen
          </button>
        }
      />

      {/* KPI-Cards (dunkel) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DarkKpi icon={Wallet} label={`Gesamtausgaben (${currentYear})`} value={eur(kpis.yearTotal)} />
        <DarkKpi icon={Receipt} label="Durchschnittliche Rechnung" value={eur(kpis.avg)} />
        <DarkKpi icon={Building2} label="Anzahl Lieferanten" value={num(kpis.lieferanten)} />
        <DarkKpi icon={Timer} label="⌀ Bearbeitungszeit" value={kpis.bearbeitung} />
      </div>

      {/* Monatliche Ausgaben + Top-Lieferanten */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`${CARD} lg:col-span-2`}>
          <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Ausgaben nach Monat</h2>
          {monthly.length === 0 ? (
            <p className="py-12 text-center text-sm text-[#64748b]">Keine Detaildaten für die Monatsauswertung.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthly} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ede7df" vertical={false} />
                  <XAxis dataKey="monat" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={{ stroke: "#e7e0d6" }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e7e0d6", fontSize: 12 }}
                    formatter={(v: number, n) => [eur(v), n === "netto" ? "Netto" : n === "ust" ? "USt" : "Vorjahr"]}
                  />
                  <Bar dataKey="netto" stackId="a" fill="#003856" radius={[0, 0, 0, 0]} maxBarSize={42} />
                  <Bar dataKey="ust" stackId="a" fill="#c8985a" radius={[6, 6, 0, 0]} maxBarSize={42} />
                  <Line type="monotone" dataKey="vorjahr" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 4" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#64748b]">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#003856]" />Netto</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#c8985a]" />USt</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 bg-[#94a3b8]" />Vorjahr</span>
          </div>
        </div>

        {/* Top 5 Lieferanten Donut */}
        <div className={CARD}>
          <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Top 5 Lieferanten</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topSuppliers}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={75}
                  paddingAngle={2}
                  onClick={(_, idx) => router.push(`/lieferanten/${encodeURIComponent(topSuppliers[idx].name)}`)}
                >
                  {topSuppliers.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} className="cursor-pointer outline-none" />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => eur(v)} contentStyle={{ borderRadius: 12, border: "1px solid #e7e0d6", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1.5">
            {topSuppliers.map((s, i) => (
              <li key={s.name}>
                <button
                  onClick={() => router.push(`/lieferanten/${encodeURIComponent(s.name)}`)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1 text-left text-sm transition hover:bg-[#faf9f7]"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="truncate text-[#1a1a2e]">{s.name}</span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums text-[#64748b]">{eur(s.value)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Kategorie + Status */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={CARD}>
          <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Ausgaben nach Kategorie (Konto)</h2>
          {categories.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#64748b]">Keine Kontierungsdaten verfügbar.</p>
          ) : (
            <ul className="space-y-3">
              {categories.map((c) => (
                <li key={c.konto}>
                  <button
                    onClick={() => router.push("/rechnungen")}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[#1a1a2e]">Konto {c.konto}</span>
                      <span className="tabular-nums text-[#64748b]">{eur(c.value)}</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#003856]/5">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#003856] to-[#c8985a]" style={{ width: `${(c.value / maxCat) * 100}%` }} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={CARD}>
          <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Status-Übersicht</h2>
          {statusData.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#64748b]">Keine Statusdaten.</p>
          ) : (
            <div className="flex items-center gap-6">
              <div className="h-44 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="label" innerRadius={44} outerRadius={70} paddingAngle={2}>
                      {statusData.map((d, i) => (
                        <Cell key={i} fill={d.color} className="outline-none" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => eur(v)} contentStyle={{ borderRadius: 12, border: "1px solid #e7e0d6", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2">
                {statusData.map((d) => (
                  <li key={d.label} className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-[#1a1a2e]">{d.label}</span>
                    <span className="ml-auto font-medium tabular-nums text-[#64748b]">{eur(d.value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
