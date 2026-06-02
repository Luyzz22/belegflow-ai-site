"use client";

import { useEffect, useState, useCallback } from "react";
import { flowcheckApi, type AuditEntry } from "@/lib/api-client";
import { dateDE } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/States";

const LIMIT = 50;

export default function AuditPage() {
  const [items, setItems] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [von, setVon] = useState("");
  const [bis, setBis] = useState("");
  const [aktion, setAktion] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (von) params.set("von", von);
    if (bis) params.set("bis", bis);
    if (aktion) params.set("aktion", aktion);
    params.set("limit", String(LIMIT));
    params.set("offset", String(offset));
    flowcheckApi
      .audit(params.toString())
      .then((r) => {
        setItems(r.items || []);
        setTotal(r.total || 0);
        setError(null);
      })
      .catch((e) => setError(e?.message || "Fehler beim Laden"))
      .finally(() => setLoading(false));
  }, [von, bis, aktion, offset]);

  useEffect(() => {
    load();
  }, [load]);

  const apply = () => setOffset(0);

  const goPage = (next: number) => {
    setLoading(true);
    setOffset(next);
  };

  const retry = () => {
    setLoading(true);
    setError(null);
    load();
  };

  const page = Math.floor(offset / LIMIT) + 1;
  const pages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="fc-fade-in">
      <PageHeader
        title="Audit-Trail"
        description="Revisionssichere Protokollierung aller Aktionen"
        action={
          <a
            href={flowcheckApi.auditCsvUrl()}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#003856] ring-1 ring-stone-200 transition hover:bg-stone-50"
          >
            ⬇ CSV exportieren
          </a>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/60">
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-500">Von</label>
          <input
            type="date"
            value={von}
            onChange={(e) => setVon(e.target.value)}
            className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm outline-none focus:border-[#003856]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-500">Bis</label>
          <input
            type="date"
            value={bis}
            onChange={(e) => setBis(e.target.value)}
            className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm outline-none focus:border-[#003856]"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="mb-1 block text-xs font-medium text-stone-500">Aktion</label>
          <input
            value={aktion}
            onChange={(e) => setAktion(e.target.value)}
            placeholder="z. B. freigabe, upload, export"
            className="w-full rounded-lg border border-stone-200 px-3 py-1.5 text-sm outline-none focus:border-[#003856]"
          />
        </div>
        <button
          onClick={apply}
          className="rounded-xl bg-[#003856] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#002a42]"
        >
          Filtern
        </button>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : items.length === 0 ? (
        <EmptyState icon="📖" title="Keine Einträge" description="Für die gewählten Filter gibt es keine Protokolleinträge." />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/60">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left text-xs uppercase tracking-wide text-stone-400">
                  <th className="px-5 py-3 font-medium">Zeitpunkt</th>
                  <th className="px-5 py-3 font-medium">Aktion</th>
                  <th className="px-5 py-3 font-medium">Benutzer</th>
                  <th className="px-5 py-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {items.map((a) => (
                  <tr key={a.id} className="transition hover:bg-stone-50">
                    <td className="whitespace-nowrap px-5 py-3 text-stone-500">{dateDE(a.zeitpunkt, true)}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-md bg-[#003856]/5 px-2 py-0.5 text-xs font-semibold text-[#003856]">
                        {a.aktion}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-stone-700">{a.benutzer}</td>
                    <td className="px-5 py-3 text-stone-500">{a.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && total > LIMIT && (
        <div className="mt-4 flex items-center justify-between text-sm text-stone-500">
          <span>
            Seite {page} von {pages} · {total} Einträge
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => goPage(Math.max(0, offset - LIMIT))}
              disabled={offset === 0}
              className="rounded-lg bg-white px-3 py-1.5 font-medium ring-1 ring-stone-200 transition hover:bg-stone-50 disabled:opacity-40"
            >
              ← Zurück
            </button>
            <button
              onClick={() => goPage(offset + LIMIT)}
              disabled={offset + LIMIT >= total}
              className="rounded-lg bg-white px-3 py-1.5 font-medium ring-1 ring-stone-200 transition hover:bg-stone-50 disabled:opacity-40"
            >
              Weiter →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
