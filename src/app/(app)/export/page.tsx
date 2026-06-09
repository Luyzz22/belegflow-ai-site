"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { flowcheckApi, API_BASE, getToken, ApiError } from "@/lib/api-client";
import PageHeader from "@/components/PageHeader";
import { ErrorState, EmptyState, TableSkeleton, Spinner } from "@/components/States";

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
      .then((d) => {
        setBuchungen(d.buchungen || []);
        setError(null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Vorschau konnte nicht geladen werden."))
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
            className="inline-flex items-center gap-2 rounded-xl bg-[#FFB900] px-5 py-2.5 font-semibold text-[#003856] transition-all hover:bg-[#e6a800] disabled:opacity-50"
          >
            {downloading ? <Spinner className="h-4 w-4 text-[#003856]" /> : <Download className="h-4 w-4" />}
            DATEV-CSV herunterladen
          </button>
        }
      />

      {msg && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-[#003856]/10 bg-[#003856]/5 px-4 py-3 text-sm text-[#003856]">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {msg}
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : buchungen.length === 0 ? (
        <EmptyState
          icon={<FileSpreadsheet className="h-6 w-6" />}
          title="Keine exportbereiten Buchungen"
          description="Sobald Rechnungen freigegeben sind, erscheinen sie hier als DATEV-Buchungssätze."
        />
      ) : (
        <>
          <div className="mb-6 rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
            <p className="text-sm text-[#64748b]">
              <span className="font-semibold text-[#003856]">{buchungen.length}</span> Buchungssätze bereit für den
              Export. Format: DATEV-CSV (SKR03/04 kompatibel).
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(0,56,86,0.06)] text-left text-xs font-medium uppercase tracking-wider text-[#64748b]">
                    {columns.map((c) => (
                      <th key={c} className="whitespace-nowrap px-6 py-4">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(0,56,86,0.06)]">
                  {buchungen.map((b, i) => (
                    <tr key={i} className="transition hover:bg-[#faf9f7]">
                      {columns.map((c) => (
                        <td key={c} className="whitespace-nowrap px-6 py-3.5 text-[#1a1a2e]">
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
