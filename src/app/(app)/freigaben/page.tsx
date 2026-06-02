"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { flowcheckApi, type Freigabe } from "@/lib/api-client";
import { eur, dateDE } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { LoadingState, ErrorState, EmptyState, Spinner } from "@/components/States";

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
        description="Offene Rechnungen, die auf Ihre Genehmigung warten"
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : items.length === 0 ? (
        <EmptyState icon="✅" title="Keine offenen Freigaben" description="Alle Rechnungen sind bearbeitet." />
      ) : (
        <div className="space-y-3">
          {items.map((f) => (
            <div
              key={f.id}
              className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200/60 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/rechnungen/${f.invoice_id}`}
                    className="font-medium text-stone-800 hover:text-[#003856]"
                  >
                    {f.lieferant || "—"}
                  </Link>
                  <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600">
                    Stufe {f.stufe}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-stone-400">
                  Rechnung #{f.invoice_id} · erstellt {dateDE(f.erstellt_am, true)}
                </p>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-lg font-semibold text-[#003856]">{eur(f.betrag)}</span>
                <button
                  onClick={() => setRejectFor(f)}
                  disabled={actingId === f.id}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50 disabled:opacity-50"
                >
                  Ablehnen
                </button>
                <button
                  onClick={() => approve(f)}
                  disabled={actingId === f.id}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {actingId === f.id && <Spinner className="h-4 w-4 text-white" />}
                  Genehmigen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRejectFor(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#003856]">Freigabe ablehnen</h3>
            <p className="mt-1 text-sm text-stone-500">
              {rejectFor.lieferant} · {eur(rejectFor.betrag)}
            </p>
            <label className="mt-4 block text-sm font-medium text-stone-700">Grund der Ablehnung</label>
            <textarea
              value={grund}
              onChange={(e) => setGrund(e.target.value)}
              rows={3}
              autoFocus
              placeholder="z. B. Betrag weicht von Bestellung ab"
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/10"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setRejectFor(null)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmReject}
                disabled={actingId === rejectFor.id}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-50"
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
