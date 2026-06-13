"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, FileSpreadsheet, CheckCircle2, History } from "lucide-react";
import { flowcheckApi, API_BASE, getToken, ApiError, type DatevBuchung, type AuditEntry } from "@/lib/api-client";
import { eur, dateDE } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { ErrorState, EmptyState, TableSkeleton, Spinner } from "@/components/States";

// Spaltendefinition mit mehreren möglichen Backend-Schlüsseln pro Spalte.
const COLUMNS: { label: string; keys: string[]; money?: boolean }[] = [
  { label: "Lieferant", keys: ["lieferant", "Lieferant", "rechnungsaussteller"] },
  { label: "Rechnungsnr", keys: ["rechnungsnummer", "rechnungsnr", "Rechnungsnummer", "belegfeld1", "belegnr"] },
  { label: "Betrag", keys: ["betrag", "Betrag", "umsatz", "buchungsbetrag"], money: true },
  { label: "Konto", keys: ["konto", "Konto"] },
  { label: "Gegenkonto", keys: ["gegenkonto", "Gegenkonto", "gegen_konto"] },
  { label: "SK", keys: ["steuerschluessel", "sk", "SK", "bu_schluessel", "buschluessel"] },
];

function pick(row: DatevBuchung, keys: string[]): string | number | undefined {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

function extractCount(details: string): string {
  const m = details?.match(/(\d+)\s*Buchung/i);
  return m ? `${m[1]} Buchungen` : "—";
}

function extractHash(details: string): string {
  const m = details?.match(/\b[a-f0-9]{8,64}\b/i);
  return m ? `${m[0].slice(0, 8)}…` : "—";
}

export default function ExportPage() {
  const [buchungen, setBuchungen] = useState<DatevBuchung[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<AuditEntry[]>([]);

  const load = useCallback(() => {
    flowcheckApi
      .datevPreview()
      .then((d) => {
        setBuchungen(d.items || []);
        setError(null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Vorschau konnte nicht geladen werden."))
      .finally(() => setLoading(false));
  }, []);

  // Export-Historie aus dem Audit-Trail.
  useEffect(() => {
    flowcheckApi
      .audit("aktion=datev_export&limit=20")
      .then((d) => setHistory(d.items || []))
      .catch(() => setHistory([]));
  }, [msg]);

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

  // Benannte Spalten verwenden, wenn das Backend bekannte Schlüssel liefert,
  // sonst generisch alle Felder anzeigen (damit immer Daten sichtbar sind).
  const useNamed =
    buchungen.length > 0 && COLUMNS.some((col) => col.keys.some((k) => k in buchungen[0]));
  const genericCols = buchungen.length > 0 ? Object.keys(buchungen[0]) : [];

  return (
    <div className="fc-fade-in">
      <PageHeader
        title="DATEV-Export"
        description="Buchungssätze prüfen und als DATEV-CSV exportieren"
        action={
          <button
            onClick={download}
            disabled={downloading || buchungen.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FFB900] px-5 py-2.5 font-semibold text-[#003856] transition-all hover:bg-[#e6a800] active:scale-95 disabled:opacity-50"
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
                    {(useNamed ? COLUMNS.map((c) => c.label) : genericCols).map((c) => (
                      <th key={c} className="whitespace-nowrap px-6 py-4">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(0,56,86,0.06)]">
                  {buchungen.map((b, i) => (
                    <tr key={i} className="transition hover:bg-[#faf9f7]">
                      {useNamed
                        ? COLUMNS.map((col) => {
                            const v = pick(b, col.keys);
                            const display =
                              col.money && v !== undefined && !Number.isNaN(Number(v))
                                ? eur(Number(v))
                                : v ?? "—";
                            return (
                              <td key={col.label} className="whitespace-nowrap px-6 py-3.5 text-[#1a1a2e]">
                                {String(display)}
                              </td>
                            );
                          })
                        : genericCols.map((c) => (
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

      {/* Bisherige Exporte */}
      {history.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-[#1a1a2e]">
            <History className="h-5 w-5 text-[#003856]" />
            Bisherige Exporte
          </h2>
          <div className="overflow-hidden rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(0,56,86,0.06)] text-left text-xs font-medium uppercase tracking-wider text-[#64748b]">
                    <th className="px-6 py-3.5">Datum</th>
                    <th className="px-6 py-3.5">Buchungen</th>
                    <th className="px-6 py-3.5">Benutzer</th>
                    <th className="px-6 py-3.5">SHA-256</th>
                    <th className="px-6 py-3.5 text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(0,56,86,0.06)]">
                  {history.map((h) => (
                    <tr key={h.id} className="transition hover:bg-[#faf9f7]">
                      <td className="whitespace-nowrap px-6 py-3.5 text-[#64748b]">{dateDE(h.zeitpunkt, true)}</td>
                      <td className="px-6 py-3.5 text-[#1a1a2e]">{extractCount(h.details || "")}</td>
                      <td className="px-6 py-3.5 text-[#1a1a2e]">{h.benutzer || "—"}</td>
                      <td className="px-6 py-3.5 font-mono text-xs text-[#64748b]">{extractHash(h.details || "")}</td>
                      <td className="px-6 py-3.5 text-right">
                        <a
                          href={flowcheckApi.auditCsvUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-lg p-1.5 text-[#003856] transition hover:bg-[#003856]/5 active:scale-95"
                          aria-label="Herunterladen"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
