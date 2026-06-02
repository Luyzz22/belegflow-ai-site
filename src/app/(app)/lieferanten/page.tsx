"use client";

import { useEffect, useState, useCallback } from "react";
import { flowcheckApi, type Lieferant } from "@/lib/api-client";
import { eur, num, dateDE } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/States";

function RiskBadge({ score }: { score: number }) {
  let cls = "bg-emerald-50 text-emerald-700 ring-emerald-200";
  let label = "Niedrig";
  if (score >= 66) {
    cls = "bg-rose-50 text-rose-700 ring-rose-200";
    label = "Hoch";
  } else if (score >= 33) {
    cls = "bg-amber-50 text-amber-700 ring-amber-200";
    label = "Mittel";
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ${cls}`}>
      <span className="tabular-nums">{Math.round(score)}</span>· {label}
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
      .then((r) => {
        setItems(r.items || []);
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

  const filtered = items.filter((l) => l.name?.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="fc-fade-in">
      <PageHeader
        title="Lieferanten"
        description={items.length > 0 ? `${items.length} Lieferanten` : "Übersicht aller Lieferanten"}
        action={
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Suchen …"
            className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/10"
          />
        }
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🏢" title="Keine Lieferanten" description={q ? "Keine Treffer für Ihre Suche." : "Noch keine Lieferanten erfasst."} />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/60">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left text-xs uppercase tracking-wide text-stone-400">
                  <th className="px-5 py-3 font-medium">Lieferant</th>
                  <th className="px-5 py-3 text-right font-medium">Rechnungen</th>
                  <th className="px-5 py-3 text-right font-medium">Volumen</th>
                  <th className="px-5 py-3 text-right font-medium">Ø Betrag</th>
                  <th className="px-5 py-3 font-medium">Letzte</th>
                  <th className="px-5 py-3 font-medium">Risiko</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((l) => (
                  <tr key={l.name} className="transition hover:bg-stone-50">
                    <td className="px-5 py-3 font-medium text-stone-800">{l.name}</td>
                    <td className="px-5 py-3 text-right text-stone-600">{num(l.anzahl_rechnungen)}</td>
                    <td className="px-5 py-3 text-right font-medium text-stone-800">{eur(l.gesamtvolumen)}</td>
                    <td className="px-5 py-3 text-right text-stone-600">{eur(l.durchschnitt)}</td>
                    <td className="px-5 py-3 text-stone-500">{dateDE(l.letzte_rechnung)}</td>
                    <td className="px-5 py-3"><RiskBadge score={l.risiko_score ?? 0} /></td>
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
