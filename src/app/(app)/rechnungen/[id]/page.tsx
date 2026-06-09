"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Check,
  X,
  Download,
  Loader2,
} from "lucide-react";
import { flowcheckApi, ApiError, type InvoiceDetail } from "@/lib/api-client";
import { eur, dateDE, pct } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { LoadingState, ErrorState } from "@/components/States";

type Tab = "validierung" | "kontierung" | "anomalien";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[rgba(0,56,86,0.06)] py-3 last:border-0">
      <dt className="text-sm text-[#64748b]">{label}</dt>
      <dd className="text-right text-sm font-medium text-[#1a1a2e]">{value || "—"}</dd>
    </div>
  );
}

function ValidRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[rgba(0,56,86,0.06)] py-3 last:border-0">
      <span className="text-sm text-[#64748b]">{label}</span>
      {ok ? (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Gültig
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
          <XCircle className="h-3.5 w-3.5" />
          Ungültig
        </span>
      )}
    </div>
  );
}

const CARD =
  "rounded-2xl bg-white border border-[rgba(0,56,86,0.08)] shadow-[0_1px_3px_rgba(0,56,86,0.06)] p-6";

const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: "validierung", label: "Validierung", icon: <ShieldCheck className="h-4 w-4" /> },
  { value: "kontierung", label: "Kontierung", icon: <Calculator className="h-4 w-4" /> },
  { value: "anomalien", label: "Anomalien", icon: <AlertTriangle className="h-4 w-4" /> },
];

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const invalidId = !id || Number.isNaN(id);

  const [detail, setDetail] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>("validierung");
  const [actionBusy, setActionBusy] = useState<null | "approve" | "reject" | "export">(null);
  const [flash, setFlash] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(() => {
    if (invalidId) return;
    flowcheckApi
      .invoice(id)
      .then((d) => {
        setDetail(d);
        setError(null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Rechnung konnte nicht geladen werden."))
      .finally(() => setLoading(false));
  }, [id, invalidId]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    void load();
  }, [load]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleApprove = useCallback(async () => {
    setActionBusy("approve");
    setFlash(null);
    try {
      await flowcheckApi.approve(id);
      setFlash({ type: "success", text: "Rechnung freigegeben." });
      await load();
    } catch (e) {
      setFlash({
        type: "error",
        text: e instanceof ApiError ? e.message : "Freigabe fehlgeschlagen.",
      });
    } finally {
      setActionBusy(null);
    }
  }, [id, load]);

  const handleReject = useCallback(async () => {
    const grund = window.prompt("Grund für die Ablehnung:");
    if (grund === null) return;
    if (!grund.trim()) {
      setFlash({ type: "error", text: "Bitte geben Sie einen Ablehnungsgrund an." });
      return;
    }
    setActionBusy("reject");
    setFlash(null);
    try {
      await flowcheckApi.reject(id, grund.trim());
      setFlash({ type: "success", text: "Rechnung abgelehnt." });
      await load();
    } catch (e) {
      setFlash({
        type: "error",
        text: e instanceof ApiError ? e.message : "Ablehnung fehlgeschlagen.",
      });
    } finally {
      setActionBusy(null);
    }
  }, [id, load]);

  const handleExport = useCallback(async () => {
    setActionBusy("export");
    setFlash(null);
    try {
      await flowcheckApi.datevPreview();
      setFlash({ type: "success", text: "DATEV-Export vorbereitet." });
    } catch (e) {
      setFlash({
        type: "error",
        text: e instanceof ApiError ? e.message : "Export fehlgeschlagen.",
      });
    } finally {
      setActionBusy(null);
    }
  }, []);

  const BackLink = (
    <Link
      href="/rechnungen"
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#64748b] transition hover:text-[#003856]"
    >
      <ArrowLeft className="h-4 w-4" />
      Zurück zu Rechnungen
    </Link>
  );

  if (invalidId) {
    return (
      <div className="fc-fade-in">
        {BackLink}
        <ErrorState message="Ungültige Rechnungs-ID." />
      </div>
    );
  }
  if (loading) return <LoadingState label="Rechnung wird geladen …" />;
  if (error || !detail) {
    return (
      <div className="fc-fade-in">
        {BackLink}
        <ErrorState message={error || "Rechnung nicht gefunden."} onRetry={retry} />
      </div>
    );
  }

  const detailData = detail;
  const pflicht = detailData.validierung?.pflichtangaben ?? [];
  const anomalien = detailData.anomalien ?? [];

  return (
    <div className="fc-fade-in pb-6">
      {BackLink}
      <PageHeader
        title={`Rechnung ${detailData.rechnungsnummer || "—"}`}
        description={`${detailData.lieferant || "—"} · ${dateDE(detailData.datum)}`}
        action={<StatusBadge status={detailData.status} />}
      />

      {flash && (
        <div
          className={`mb-5 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            flash.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {flash.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          {flash.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Extrahierte Felder */}
        <section className={CARD}>
          <h2 className="mb-2 text-xl font-semibold text-[#1a1a2e]">Extrahierte Felder</h2>
          <dl>
            <Field label="Lieferant" value={detailData.lieferant} />
            <Field label="Rechnungsnr." value={detailData.rechnungsnummer} />
            <Field label="Datum" value={dateDE(detailData.datum)} />
            <Field label="Betrag" value={eur(detailData.betrag, detailData.waehrung)} />
            <Field label="Netto" value={eur(detailData.netto, detailData.waehrung)} />
            <Field
              label={`USt-Betrag (${pct(detailData.ust_satz)})`}
              value={eur(detailData.ust_betrag, detailData.waehrung)}
            />
            <Field label="IBAN" value={detailData.iban} />
            <Field label="USt-ID" value={detailData.ust_id} />
          </dl>
        </section>

        {/* Vorschau */}
        <section className={CARD}>
          <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Vorschau</h2>
          <div className="flex h-[calc(100%-2.75rem)] min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[rgba(0,56,86,0.15)] bg-[#faf9f7] p-10 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#003856]/5 text-[#003856]">
              <FileText className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium text-[#1a1a2e]">Keine PDF-Vorschau verfügbar</p>
            <p className="mt-1 text-xs text-[#64748b]">
              Für diese Rechnung liegt kein Dokument zur Anzeige vor.
            </p>
          </div>
        </section>
      </div>

      {/* Tabs */}
      <div className="mt-6 rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
        <div className="flex gap-1 border-b border-[rgba(0,56,86,0.08)] p-2">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setActiveTab(t.value)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                activeTab === t.value
                  ? "bg-[#003856] text-white"
                  : "text-[#64748b] hover:bg-[#003856]/5 hover:text-[#003856]"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "validierung" && (
            <div>
              <dl>
                <ValidRow label="IBAN gültig" ok={!!detailData.validierung?.iban_valid} />
                <ValidRow label="USt-ID gültig" ok={!!detailData.validierung?.ustid_valid} />
              </dl>
              <div className="mt-5">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#64748b]">
                  §14 UStG · Pflichtangaben
                </p>
                {pflicht.length === 0 ? (
                  <p className="text-sm text-[#64748b]">Keine Pflichtangaben hinterlegt.</p>
                ) : (
                  <ul className="space-y-2">
                    {pflicht.map((p, i) => {
                      const ok = typeof p === "string" ? true : !!p.vorhanden;
                      const label = typeof p === "string" ? p : p.feld;
                      return (
                        <li key={i} className="flex items-center gap-2.5 text-sm">
                          {ok ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          ) : (
                            <XCircle className="h-4 w-4 shrink-0 text-red-600" />
                          )}
                          <span className="text-[#1a1a2e]">{label}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}

          {activeTab === "kontierung" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                ["Konto", detailData.kontierung?.konto],
                ["Gegenkonto", detailData.kontierung?.gegenkonto],
                ["Steuerschlüssel", detailData.kontierung?.steuerschluessel],
              ].map(([label, val]) => (
                <div
                  key={label as string}
                  className="rounded-xl border border-[rgba(0,56,86,0.08)] bg-[#faf9f7] p-4"
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-[#64748b]">
                    {label}
                  </p>
                  <p className="mt-1.5 text-lg font-semibold text-[#003856]">{val || "—"}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "anomalien" && (
            <div>
              {anomalien.length === 0 ? (
                <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Keine Anomalien erkannt.
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {anomalien.map((a, i) => {
                    const text =
                      typeof a === "string" ? a : a.beschreibung || a.typ || "Anomalie";
                    const schwere = typeof a === "string" ? undefined : a.schwere;
                    return (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                      >
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                          {text}
                          {schwere && (
                            <span className="ml-2 rounded-md bg-amber-100 px-1.5 py-0.5 text-xs font-semibold uppercase">
                              {schwere}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Aktionen */}
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-4 shadow-[0_1px_3px_rgba(0,56,86,0.06)] sm:flex-row sm:items-center sm:justify-end">
        <button
          onClick={handleReject}
          disabled={actionBusy !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50"
        >
          {actionBusy === "reject" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
          Ablehnen
        </button>
        <button
          onClick={handleApprove}
          disabled={actionBusy !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
        >
          {actionBusy === "approve" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Freigeben
        </button>
        <button
          onClick={handleExport}
          disabled={actionBusy !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 font-medium text-white transition-all hover:bg-[#002a42] disabled:opacity-50"
        >
          {actionBusy === "export" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Exportieren
        </button>
      </div>
    </div>
  );
}
