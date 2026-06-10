"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronRight, ChevronLeft, Plus, X } from "lucide-react";
import { flowcheckApi, ApiError, type InvoiceListItem } from "@/lib/api-client";
import { eur, dateDE } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import Toast from "@/components/Toast";
import { TableSkeleton, ErrorState, EmptyState } from "@/components/States";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Alle" },
  { value: "neu", label: "Neu" },
  { value: "verarbeitet", label: "Verarbeitet" },
  { value: "freigegeben", label: "Freigegeben" },
  { value: "exportiert", label: "Exportiert" },
];

const PERIODS: { value: string; label: string }[] = [
  { value: "", label: "Alle Zeiträume" },
  { value: "7", label: "Letzte 7 Tage" },
  { value: "30", label: "Letzte 30 Tage" },
  { value: "90", label: "Letzte 90 Tage" },
];

const PER_PAGE = 20;

type ToastState = { type: "success" | "error"; text: string } | null;

export default function RechnungenPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={8} cols={6} />}>
      <RechnungenInner />
    </Suspense>
  );
}

function RechnungenInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(() => searchParams.get("status") ?? "");
  const [period, setPeriod] = useState("");
  const [cutoff, setCutoff] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<ToastState>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = useCallback(() => {
    flowcheckApi
      .invoices()
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
    const q = query.trim().toLowerCase();
    return items.filter((inv) => {
      if (status && (inv.status || "").toLowerCase() !== status) return false;
      if (q) {
        const haystack = `${inv.lieferant || ""} ${inv.rechnungsnummer || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (cutoff != null) {
        const ref = inv.datum || inv.created_at;
        const t = ref ? new Date(ref).getTime() : NaN;
        if (Number.isNaN(t) || t < cutoff) return false;
      }
      return true;
    });
  }, [items, query, status, cutoff]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const allPageSelected = pageItems.length > 0 && pageItems.every((inv) => selectedIds.has(inv.id));

  const resetPage = () => setPage(1);

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageItems.forEach((inv) => next.delete(inv.id));
      } else {
        pageItems.forEach((inv) => next.add(inv.id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkApprove = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0 || bulkBusy) return;
    setBulkBusy(true);
    Promise.allSettled(ids.map((id) => flowcheckApi.approve(id)))
      .then((results) => {
        const ok = results.filter((r) => r.status === "fulfilled").length;
        setToast({
          type: ok === ids.length ? "success" : "error",
          text: `${ok} von ${ids.length} freigegeben`,
        });
        setSelectedIds(new Set());
        setLoading(true);
        void load();
      })
      .finally(() => setBulkBusy(false));
  };

  const bulkExport = () => {
    if (bulkBusy) return;
    setBulkBusy(true);
    flowcheckApi
      .datevPreview()
      .then(() => setToast({ type: "success", text: "DATEV-Export vorbereitet." }))
      .catch((e) =>
        setToast({
          type: "error",
          text: e instanceof ApiError ? e.message : "DATEV-Export fehlgeschlagen.",
        })
      )
      .finally(() => setBulkBusy(false));
  };

  return (
    <div className="fc-fade-in">
      {toast && <Toast type={toast.type} text={toast.text} onClose={() => setToast(null)} />}

      <PageHeader
        title="Rechnungen"
        description="Alle verarbeiteten Eingangsrechnungen"
        action={
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 font-medium text-white transition-all hover:bg-[#002a42] active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Hochladen
          </Link>
        }
      />

      <div className="mb-5 rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetPage();
              }}
              placeholder="Lieferant, Rechnungsnr. suchen …"
              className="w-full rounded-xl border border-[rgba(0,56,86,0.12)] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
            />
          </div>
          <select
            value={period}
            onChange={(e) => {
              const v = e.target.value;
              setPeriod(v);
              const days = v ? Number(v) : 0;
              setCutoff(days ? Date.now() - days * 24 * 60 * 60 * 1000 : null);
              resetPage();
            }}
            className="rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setStatus(f.value);
                resetPage();
              }}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition active:scale-95 ${
                status === f.value
                  ? "bg-[#003856] text-white"
                  : "bg-[#faf9f7] text-[#64748b] hover:bg-[#003856]/5 hover:text-[#003856]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : filtered.length === 0 ? (
        items.length === 0 ? (
          <EmptyState
            title="Noch keine Rechnungen verarbeitet."
            description="Laden Sie Ihre erste Rechnung hoch."
            action={
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 font-medium text-white transition-all hover:bg-[#002a42] active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Zum Upload
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title="Keine Treffer."
            description="Passen Sie Suche oder Filter an."
          />
        )
      ) : (
        <>
          {selectedIds.size > 0 && (
            <div className="fc-pop sticky top-4 z-30 mb-4 flex items-center justify-between rounded-2xl bg-[#003856] px-6 py-3 text-white shadow-lg">
              <span className="text-sm font-medium">{selectedIds.size} ausgewählt</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={bulkApprove}
                  disabled={bulkBusy}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 active:scale-95 disabled:opacity-50"
                >
                  Freigeben
                </button>
                <button
                  onClick={bulkExport}
                  disabled={bulkBusy}
                  className="rounded-xl bg-[#FFB900] px-4 py-2 text-sm font-medium text-[#003856] transition hover:bg-[#e6a700] active:scale-95 disabled:opacity-50"
                >
                  Exportieren
                </button>
                <button
                  onClick={clearSelection}
                  aria-label="Auswahl aufheben"
                  className="rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white active:scale-95"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
            <div className="overflow-visible">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(0,56,86,0.08)] text-left text-xs font-medium uppercase tracking-wider text-[#64748b]">
                    <th className="w-12 px-6 py-3.5">
                      <input
                        type="checkbox"
                        aria-label="Alle auf dieser Seite auswählen"
                        checked={allPageSelected}
                        onChange={toggleAllPage}
                        className="h-4 w-4 cursor-pointer rounded border-[rgba(0,56,86,0.3)] accent-[#003856]"
                      />
                    </th>
                    <th className="px-6 py-3.5">Lieferant</th>
                    <th className="px-6 py-3.5">Rechnungsnr.</th>
                    <th className="px-6 py-3.5">Datum</th>
                    <th className="px-6 py-3.5 text-right">Betrag</th>
                    <th className="px-6 py-3.5 text-right">USt</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5" aria-label="Details" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(0,56,86,0.06)]">
                  {pageItems.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => router.push(`/rechnungen/${inv.id}`)}
                      className="group relative cursor-pointer transition hover:bg-[#faf9f7]"
                    >
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          aria-label={`Rechnung ${inv.rechnungsnummer || inv.id} auswählen`}
                          checked={selectedIds.has(inv.id)}
                          onChange={() => toggleOne(inv.id)}
                          className="h-4 w-4 cursor-pointer rounded border-[rgba(0,56,86,0.3)] accent-[#003856]"
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-[#1a1a2e]">
                        {inv.lieferant || "—"}
                        <div className="pointer-events-none absolute left-24 top-full z-20 hidden w-64 rounded-xl border border-[rgba(0,56,86,0.08)] bg-white p-4 shadow-lg group-hover:block">
                          <p className="font-semibold text-[#1a1a2e]">{inv.lieferant || "—"}</p>
                          <p className="mt-1 text-lg font-bold text-[#003856]">
                            {eur(inv.betrag, inv.waehrung)}
                          </p>
                          <p className="mt-1 text-xs text-[#64748b]">{dateDE(inv.datum)}</p>
                          <div className="mt-2">
                            <StatusBadge status={inv.status} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#64748b]">{inv.rechnungsnummer || "—"}</td>
                      <td className="px-6 py-4 text-[#64748b]">{dateDE(inv.datum)}</td>
                      <td className="px-6 py-4 text-right font-medium text-[#1a1a2e]">
                        {eur(inv.betrag, inv.waehrung)}
                      </td>
                      <td className="px-6 py-4 text-right text-[#64748b]">—</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight className="ml-auto h-4 w-4 text-[#64748b]" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-[#64748b]">
              <span>
                Seite {currentPage} von {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-[rgba(0,56,86,0.12)] bg-white px-4 py-2 font-medium text-[#003856] transition hover:bg-[#faf9f7] active:scale-95 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Zurück
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 rounded-xl border border-[rgba(0,56,86,0.12)] bg-white px-4 py-2 font-medium text-[#003856] transition hover:bg-[#faf9f7] active:scale-95 disabled:opacity-40"
                >
                  Weiter
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
