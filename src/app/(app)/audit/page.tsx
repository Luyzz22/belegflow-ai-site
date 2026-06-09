"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, ScrollText, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { flowcheckApi, ApiError, type AuditEntry } from "@/lib/api-client";
import { dateDE } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { ErrorState, EmptyState, TableSkeleton } from "@/components/States";

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
      .then((d) => {
        setItems(d.items || []);
        setTotal(d.total || 0);
        setError(null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Daten konnten nicht geladen werden."))
      .finally(() => setLoading(false));
  }, [von, bis, aktion, offset]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    void load();
  }, [load]);

  useEffect(() => {
    void load();
  }, [load]);

  const apply = () => setOffset(0);
  const goPage = (next: number) => setOffset(next);

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
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium text-[#003856] transition-all hover:bg-[#003856]/5"
          >
            <Download className="h-4 w-4" />
            CSV exportieren
          </a>
        }
      />

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#64748b]">Von</label>
          <input
            type="date"
            value={von}
            onChange={(e) => setVon(e.target.value)}
            className="rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#64748b]">Bis</label>
          <input
            type="date"
            value={bis}
            onChange={(e) => setBis(e.target.value)}
            className="rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
          />
        </div>
        <div className="min-w-[180px] flex-1">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#64748b]">Aktion</label>
          <input
            value={aktion}
            onChange={(e) => setAktion(e.target.value)}
            placeholder="z. B. freigabe, upload, export"
            className="w-full rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
          />
        </div>
        <button
          onClick={apply}
          className="inline-flex items-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 font-medium text-white transition-all hover:bg-[#002a42]"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtern
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="h-6 w-6" />}
          title="Noch keine Ereignisse."
          description="Für die gewählten Filter gibt es keine Protokolleinträge."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(0,56,86,0.06)] text-left text-xs font-medium uppercase tracking-wider text-[#64748b]">
                  <th className="px-6 py-4">Zeitpunkt</th>
                  <th className="px-6 py-4">Benutzer</th>
                  <th className="px-6 py-4">Aktion</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,56,86,0.06)]">
                {items.map((a) => (
                  <tr key={a.id} className="transition hover:bg-[#faf9f7]">
                    <td className="whitespace-nowrap px-6 py-4 text-[#64748b]">{dateDE(a.zeitpunkt, true)}</td>
                    <td className="px-6 py-4 text-[#1a1a2e]">{a.benutzer}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-[#003856]/5 px-2.5 py-1 text-xs font-semibold text-[#003856]">
                        {a.aktion}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#64748b]">{a.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && total > LIMIT && (
        <div className="mt-4 flex items-center justify-between text-sm text-[#64748b]">
          <span>
            Seite {page} von {pages} · {total} Einträge
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => goPage(Math.max(0, offset - LIMIT))}
              disabled={offset === 0}
              className="inline-flex items-center gap-1 rounded-xl border border-[rgba(0,56,86,0.12)] bg-white px-3 py-2 font-medium text-[#003856] transition hover:bg-[#faf9f7] disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Zurück
            </button>
            <button
              onClick={() => goPage(offset + LIMIT)}
              disabled={offset + LIMIT >= total}
              className="inline-flex items-center gap-1 rounded-xl border border-[rgba(0,56,86,0.12)] bg-white px-3 py-2 font-medium text-[#003856] transition hover:bg-[#faf9f7] disabled:opacity-40"
            >
              Weiter
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
