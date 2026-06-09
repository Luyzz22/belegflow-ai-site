"use client";

import { useEffect, useState, useCallback } from "react";
import { Building2, Search } from "lucide-react";
import { flowcheckApi, ApiError, type Lieferant } from "@/lib/api-client";
import { eur, num, dateDE } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { ErrorState, EmptyState, TableSkeleton } from "@/components/States";

function RiskBadge({ score }: { score: number }) {
  let cls = "bg-emerald-50 text-emerald-700";
  let label = "Niedrig";
  if (score >= 70) {
    cls = "bg-red-50 text-red-700";
    label = "Hoch";
  } else if (score >= 40) {
    cls = "bg-amber-50 text-amber-700";
    label = "Mittel";
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${cls}`}>
      <span className="tabular-nums">{Math.round(score)}</span> · {label}
    </span>
  );
}

export default function LieferantenPage() {
  const [items, setItems] = useState<Lieferant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

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

  const filtered = items.filter((l) => l.name?.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="fc-fade-in">
      <PageHeader
        title="Lieferanten"
        description={items.length > 0 ? `${items.length} Lieferanten` : "Übersicht aller Lieferanten"}
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Suchen …"
              className="rounded-xl border border-[rgba(0,56,86,0.12)] bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
            />
          </div>
        }
      />

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
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(0,56,86,0.06)] text-left text-xs font-medium uppercase tracking-wider text-[#64748b]">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4 text-right">Anzahl Rechnungen</th>
                  <th className="px-6 py-4 text-right">Gesamtvolumen</th>
                  <th className="px-6 py-4 text-right">Durchschnitt</th>
                  <th className="px-6 py-4">Letzte Rechnung</th>
                  <th className="px-6 py-4">Risiko-Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,56,86,0.06)]">
                {filtered.map((l) => (
                  <tr key={l.name} className="transition hover:bg-[#faf9f7]">
                    <td className="px-6 py-4 font-medium text-[#1a1a2e]">{l.name}</td>
                    <td className="px-6 py-4 text-right tabular-nums text-[#64748b]">{num(l.anzahl_rechnungen)}</td>
                    <td className="px-6 py-4 text-right font-semibold tabular-nums text-[#1a1a2e]">{eur(l.gesamtvolumen)}</td>
                    <td className="px-6 py-4 text-right tabular-nums text-[#64748b]">{eur(l.durchschnitt)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-[#64748b]">{dateDE(l.letzte_rechnung)}</td>
                    <td className="px-6 py-4"><RiskBadge score={l.risiko_score ?? 0} /></td>
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
