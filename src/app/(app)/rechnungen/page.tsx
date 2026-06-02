"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { flowcheckApi, type InvoiceListItem } from "@/lib/api-client";
import { eur, dateDE } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { LoadingState, ErrorState, EmptyState } from "@/components/States";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Alle" },
  { value: "neu", label: "Neu" },
  { value: "verarbeitet", label: "Verarbeitet" },
  { value: "freigegeben", label: "Freigegeben" },
  { value: "exportiert", label: "Exportiert" },
];

const LIMIT = 20;

export default function RechnungenPage() {
  const [items, setItems] = useState<InvoiceListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search) params.set("q", search);
    params.set("limit", String(LIMIT));
    params.set("offset", String(offset));
    flowcheckApi
      .invoices(params.toString())
      .then((r) => {
        setItems(r.items || []);
        setTotal(r.total || 0);
        setError(null);
      })
      .catch((e) => setError(e?.message || "Fehler beim Laden"))
      .finally(() => setLoading(false));
  }, [status, search, offset]);

  useEffect(() => {
    load();
  }, [load]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOffset(0);
    setSearch(q);
  };

  const changeStatus = (value: string) => {
    setLoading(true);
    setOffset(0);
    setStatus(value);
  };

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
        title="Rechnungen"
        description={total > 0 ? `${total} Rechnungen insgesamt` : "Alle erfassten Eingangsrechnungen"}
        action={
          <Link
            href="/upload"
            className="rounded-xl bg-[#003856] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#002a42]"
          >
            + Hochladen
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => changeStatus(f.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                status === f.value
                  ? "bg-[#003856] text-white"
                  : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <form onSubmit={submitSearch} className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Lieferant oder Nummer …"
            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2 pr-10 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/10 sm:w-72"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#003856]"
            aria-label="Suchen"
          >
            🔍
          </button>
        </form>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="🔎"
          title="Keine Rechnungen gefunden"
          description={search || status ? "Passen Sie Filter oder Suche an." : "Laden Sie Ihre erste Rechnung hoch."}
          action={
            <Link href="/upload" className="rounded-xl bg-[#003856] px-4 py-2 text-sm font-medium text-white">
              Rechnung hochladen
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/60">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left text-xs uppercase tracking-wide text-stone-400">
                  <th className="px-5 py-3 font-medium">Lieferant</th>
                  <th className="px-5 py-3 font-medium">Rechnungsnr.</th>
                  <th className="px-5 py-3 font-medium">Datum</th>
                  <th className="px-5 py-3 text-right font-medium">Betrag</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {items.map((inv) => (
                  <tr key={inv.id} className="transition hover:bg-stone-50">
                    <td className="px-5 py-3">
                      <Link href={`/rechnungen/${inv.id}`} className="font-medium text-stone-800 hover:text-[#003856]">
                        {inv.lieferant || "—"}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-stone-500">{inv.rechnungsnummer || "—"}</td>
                    <td className="px-5 py-3 text-stone-500">{dateDE(inv.datum)}</td>
                    <td className="px-5 py-3 text-right font-medium text-stone-800">{eur(inv.betrag, inv.waehrung)}</td>
                    <td className="px-5 py-3"><StatusBadge status={inv.status} /></td>
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
            Seite {page} von {pages}
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
