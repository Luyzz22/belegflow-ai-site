"use client";

import { useEffect, useState, useCallback } from "react";
import { flowcheckApi, API_BASE, getToken, ApiError } from "@/lib/api-client";
import PageHeader from "@/components/PageHeader";
import { LoadingState, ErrorState, EmptyState, Spinner } from "@/components/States";

type Buchung = Record<string, string | number>;

export default function ExportPage() {
  const [buchungen, setBuchungen] = useState<Buchung[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    flowcheckApi
      .datevPreview()
      .then((r) => {
        setBuchungen(r.buchungen || []);
        setError(null);
      })
      .catch((e) => setError(e?.message || "Vorschau konnte nicht geladen werden"))
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

  const download = async () => {
    setDownloading(true);
    setMsg(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/datev/export`, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
        throw new ApiError(err.detail || `HTTP ${res.status}`, res.status);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `datev-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMsg("Export erfolgreich heruntergeladen.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Export fehlgeschlagen");
    } finally {
      setDownloading(false);
    }
  };

  const columns = buchungen.length > 0 ? Object.keys(buchungen[0]) : [];

  return (
    <div className="fc-fade-in">
      <PageHeader
        title="DATEV-Export"
        description="Buchungssätze prüfen und als DATEV-CSV exportieren"
        action={
          <button
            onClick={download}
            disabled={downloading || buchungen.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-[#c8985a] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#b07f42] disabled:opacity-50"
          >
            {downloading && <Spinner className="h-4 w-4 text-white" />}
            📦 DATEV-CSV herunterladen
          </button>
        }
      />

      {msg && (
        <div className="mb-4 rounded-xl bg-[#003856]/5 px-4 py-3 text-sm text-[#003856] ring-1 ring-[#003856]/10">
          {msg}
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : buchungen.length === 0 ? (
        <EmptyState
          icon="📦"
          title="Keine exportbereiten Buchungen"
          description="Sobald Rechnungen freigegeben sind, erscheinen sie hier als DATEV-Buchungssätze."
        />
      ) : (
        <>
          <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/60">
            <p className="text-sm text-stone-600">
              <span className="font-semibold text-[#003856]">{buchungen.length}</span> Buchungssätze bereit für den
              Export. Format: DATEV-CSV (SKR03/04 kompatibel).
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/60">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-left text-xs uppercase tracking-wide text-stone-400">
                    {columns.map((c) => (
                      <th key={c} className="whitespace-nowrap px-4 py-3 font-medium">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {buchungen.map((b, i) => (
                    <tr key={i} className="transition hover:bg-stone-50">
                      {columns.map((c) => (
                        <td key={c} className="whitespace-nowrap px-4 py-2.5 text-stone-700">
                          {String(b[c] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
