"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { Building2, Search, LayoutGrid, List, ArrowRight } from "lucide-react";
import { flowcheckApi, ApiError, type Lieferant } from "@/lib/api-client";
import { eur, num, dateDE } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { ErrorState, EmptyState, TableSkeleton } from "@/components/States";

type SortKey = "volumen" | "anzahl" | "name";

export function RiskBadge({ score }: { score: number }) {
  let cls = "bg-emerald-50 text-emerald-700";
  let label = "Niedriges Risiko";
  if (score >= 61) {
    cls = "bg-red-50 text-red-700";
    label = "Hohes Risiko";
  } else if (score >= 31) {
    cls = "bg-amber-50 text-amber-700";
    label = "Mittleres Risiko";
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${cls}`}>
      <span className="tabular-nums">{Math.round(score)}</span> · {label}
    </span>
  );
}

function href(name: string) {
  return `/lieferanten/${encodeURIComponent(name)}`;
}

export default function LieferantenPage() {
  const [items, setItems] = useState<Lieferant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("volumen");
  const [view, setView] = useState<"cards" | "table">("cards");

  const load = useCallback(() => {
    flowcheckApi
      .lieferanten()
      .then((d) => {
        setItems(d.items || []);
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

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    const list = items.filter((l) => l.name?.toLowerCase().includes(ql));
    return list.sort((a, b) => {
      if (sort === "name") return (a.name || "").localeCompare(b.name || "");
      if (sort === "anzahl") return b.anzahl_rechnungen - a.anzahl_rechnungen;
      return b.gesamtvolumen - a.gesamtvolumen;
    });
  }, [items, q, sort]);

  return (
    <div className="fc-fade-in">
      <PageHeader
        title="Lieferanten"
        description={items.length > 0 ? `${items.length} Lieferanten` : "Übersicht aller Lieferanten"}
      />

      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Lieferant suchen …"
            className="w-full rounded-xl border border-[rgba(0,56,86,0.12)] bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-xl border border-[rgba(0,56,86,0.12)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
        >
          <option value="volumen">Nach Volumen</option>
          <option value="anzahl">Nach Anzahl</option>
          <option value="name">Nach Name</option>
        </select>
        <div className="flex rounded-xl border border-[rgba(0,56,86,0.12)] bg-white p-1">
          <button
            onClick={() => setView("cards")}
            aria-label="Kartenansicht"
            className={`rounded-lg p-2 transition ${view === "cards" ? "bg-[#003856] text-white" : "text-[#64748b] hover:bg-[#faf9f7]"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("table")}
            aria-label="Tabellenansicht"
            className={`rounded-lg p-2 transition ${view === "table" ? "bg-[#003856] text-white" : "text-[#64748b] hover:bg-[#faf9f7]"}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title={q ? "Keine Treffer" : "Noch keine Lieferanten erfasst."}
          description={q ? "Keine Lieferanten passen zu Ihrer Suche." : undefined}
        />
      ) : view === "cards" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((l) => (
            <Link
              key={l.name}
              href={href(l.name)}
              className="fc-lift group rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-5 shadow-[0_1px_3px_rgba(0,56,86,0.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#003856]/5 text-[#003856]">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <p className="truncate font-semibold text-[#1a1a2e]">{l.name}</p>
                </div>
                <RiskBadge score={l.risiko_score ?? 0} />
              </div>
              <p className="mt-4 text-2xl font-bold tabular-nums text-[#003856]">{eur(l.gesamtvolumen)}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-[#64748b]">
                <span>{num(l.anzahl_rechnungen)} Rechnungen · ⌀ {eur(l.durchschnitt)}</span>
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(0,56,86,0.06)] text-left text-xs font-medium uppercase tracking-wider text-[#64748b]">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4 text-right">Anzahl</th>
                  <th className="px-6 py-4 text-right">Gesamtvolumen</th>
                  <th className="px-6 py-4 text-right">Durchschnitt</th>
                  <th className="px-6 py-4">Letzte Rechnung</th>
                  <th className="px-6 py-4">Risiko-Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,56,86,0.06)]">
                {filtered.map((l) => (
                  <tr
                    key={l.name}
                    className="cursor-pointer transition hover:bg-[#faf9f7]"
                    onClick={() => {
                      window.location.href = href(l.name);
                    }}
                  >
                    <td className="px-6 py-4 font-medium text-[#1a1a2e]">{l.name}</td>
                    <td className="px-6 py-4 text-right tabular-nums text-[#64748b]">{num(l.anzahl_rechnungen)}</td>
                    <td className="px-6 py-4 text-right font-semibold tabular-nums text-[#1a1a2e]">{eur(l.gesamtvolumen)}</td>
                    <td className="px-6 py-4 text-right tabular-nums text-[#64748b]">{eur(l.durchschnitt)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-[#64748b]">{dateDE(l.letzte_rechnung)}</td>
                    <td className="px-6 py-4">
                      <RiskBadge score={l.risiko_score ?? 0} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
