"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { CheckCircle2, Check, X } from "lucide-react";
import { flowcheckApi, ApiError, type Freigabe } from "@/lib/api-client";
import { eur, dateDE } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { ErrorState, EmptyState, TableSkeleton, Spinner } from "@/components/States";

export default function FreigabenPage() {
  const [items, setItems] = useState<Freigabe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);
  const [rejectFor, setRejectFor] = useState<Freigabe | null>(null);
  const [grund, setGrund] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(() => {
    flowcheckApi
      .freigaben()
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

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const approve = async (f: Freigabe) => {
    setActingId(f.id);
    try {
      await flowcheckApi.approve(f.id);
      setItems((prev) => prev.filter((x) => x.id !== f.id));
      flash(`Freigabe für ${f.lieferant} genehmigt`);
    } catch (e) {
      flash(e instanceof Error ? e.message : "Aktion fehlgeschlagen");
    } finally {
      setActingId(null);
    }
  };

  const confirmReject = async () => {
    if (!rejectFor) return;
    const f = rejectFor;
    setActingId(f.id);
    try {
      await flowcheckApi.reject(f.id, grund.trim() || "Kein Grund angegeben");
      setItems((prev) => prev.filter((x) => x.id !== f.id));
      flash(`Freigabe für ${f.lieferant} abgelehnt`);
      setRejectFor(null);
      setGrund("");
    } catch (e) {
      flash(e instanceof Error ? e.message : "Aktion fehlgeschlagen");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="fc-fade-in">
      <PageHeader
        title="Freigaben"
        description="Ausstehende Rechnungsfreigaben"
      />

      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="h-6 w-6" />}
          title="Keine ausstehenden Freigaben."
          description="Alle Rechnungen sind bearbeitet."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(0,56,86,0.06)] text-left text-xs font-medium uppercase tracking-wider text-[#64748b]">
                  <th className="px-6 py-4">Lieferant</th>
                  <th className="px-6 py-4 text-right">Betrag</th>
                  <th className="px-6 py-4">Stufe</th>
                  <th className="px-6 py-4">Erstellt</th>
                  <th className="px-6 py-4 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,56,86,0.06)]">
                {items.map((f) => (
                  <tr key={f.id} className="transition hover:bg-[#faf9f7]">
                    <td className="px-6 py-4">
                      <Link
                        href={`/rechnungen/${f.invoice_id}`}
                        className="font-medium text-[#1a1a2e] transition hover:text-[#003856]"
                      >
                        {f.lieferant || "—"}
                      </Link>
                      <p className="mt-0.5 text-xs text-[#64748b]">Rechnung #{f.invoice_id}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold tabular-nums text-[#003856]">
                      {eur(f.betrag)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-[#003856]/5 px-2.5 py-1 text-xs font-semibold text-[#003856]">
                        Stufe {f.stufe}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-[#64748b]">
                      {dateDE(f.erstellt_am, true)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setRejectFor(f)}
                          disabled={actingId === f.id}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                          Ablehnen
                        </button>
                        <button
                          onClick={() => approve(f)}
                          disabled={actingId === f.id}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {actingId === f.id ? (
                            <Spinner className="h-4 w-4 text-white" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          Freigeben
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRejectFor(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-[#1a1a2e]">Freigabe ablehnen</h2>
            <p className="mt-1 text-sm text-[#64748b]">
              {rejectFor.lieferant} · {eur(rejectFor.betrag)}
            </p>
            <label className="mt-4 block text-xs font-medium uppercase tracking-wider text-[#64748b]">
              Grund der Ablehnung
            </label>
            <textarea
              value={grund}
              onChange={(e) => setGrund(e.target.value)}
              rows={3}
              autoFocus
              placeholder="z. B. Betrag weicht von Bestellung ab"
              className="mt-1.5 w-full rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setRejectFor(null)}
                className="rounded-xl px-5 py-2.5 font-medium text-[#003856] transition-all hover:bg-[#003856]/5"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmReject}
                disabled={actingId === rejectFor.id}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50"
              >
                {actingId === rejectFor.id && <Spinner className="h-4 w-4 text-white" />}
                Ablehnen
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#003856] px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
