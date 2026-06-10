"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
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
  Pencil,
  Save,
} from "lucide-react";
import { flowcheckApi, ApiError, API_BASE, getToken, type InvoiceDetail } from "@/lib/api-client";
import { eur, dateDE, pct } from "@/lib/format";
import { computeConfidence } from "@/lib/confidence";
import StatusBadge from "@/components/StatusBadge";
import ConfidenceRing from "@/components/ConfidenceRing";
import Toast from "@/components/Toast";
import { LoadingState, ErrorState } from "@/components/States";

type Tab = "validierung" | "kontierung" | "anomalien";
type Flash = { type: "success" | "error"; text: string } | null;

const CARD =
  "rounded-2xl bg-white border border-[rgba(0,56,86,0.08)] shadow-[0_1px_3px_rgba(0,56,86,0.06)] p-6";
const INPUT =
  "w-full rounded-xl border border-[rgba(0,56,86,0.12)] px-3 py-2 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20";

const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: "validierung", label: "Validierung", icon: <ShieldCheck className="h-4 w-4" /> },
  { value: "kontierung", label: "Kontierung", icon: <Calculator className="h-4 w-4" /> },
  { value: "anomalien", label: "Anomalien", icon: <AlertTriangle className="h-4 w-4" /> },
];

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[rgba(0,56,86,0.06)] py-3 last:border-0">
      <dt className="text-sm text-[#64748b]">{label}</dt>
      <dd className="text-right text-sm font-medium text-[#1a1a2e]">{value || "—"}</dd>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="py-2">
      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#64748b]">
        {label}
      </label>
      <input
        type={type}
        step={type === "number" ? "0.01" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT}
      />
    </div>
  );
}

function ValidRow({ label, ok, mono }: { label: string; ok: boolean; mono?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[rgba(0,56,86,0.06)] py-3 last:border-0">
      <span className="text-sm text-[#64748b]">
        {label}
        {mono && <span className="ml-2 font-mono text-[#1a1a2e]">{mono}</span>}
      </span>
      {ok ? (
        <span className="fc-pop inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Gültig
        </span>
      ) : (
        <span className="fc-pop inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
          <XCircle className="h-3.5 w-3.5" />
          Ungültig
        </span>
      )}
    </div>
  );
}

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const invalidId = !id || Number.isNaN(id);

  const [detail, setDetail] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>("validierung");
  const [actionBusy, setActionBusy] = useState<null | "approve" | "reject" | "export">(null);
  const [flash, setFlash] = useState<Flash>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Lokale Korrekturen (Backend hat noch keinen Update-Endpoint → nur clientseitig).
  const [overrides, setOverrides] = useState<Partial<InvoiceDetail>>({});
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [editingK, setEditingK] = useState(false);
  const [formK, setFormK] = useState({ konto: "", gegenkonto: "", steuerschluessel: "" });
  const [knownSuppliers, setKnownSuppliers] = useState<Set<string>>(new Set());

  // Bekannte Lieferanten für den Konfidenz-Score (Lieferant mit >1 Rechnung).
  useEffect(() => {
    flowcheckApi
      .lieferanten()
      .then((r) => {
        const set = new Set<string>();
        (r.items || []).forEach((l) => {
          if (l.anzahl_rechnungen > 1) set.add(l.name);
        });
        setKnownSuppliers(set);
      })
      .catch(() => setKnownSuppliers(new Set()));
  }, []);

  // PDF-Vorschau laden (Bearer-Token nötig, daher Blob statt direkter iframe-src).
  useEffect(() => {
    if (invalidId) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    const token = getToken();
    fetch(`${API_BASE}/invoices/${id}/pdf`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setPdfUrl(null);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id, invalidId]);

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
      setFlash({ type: "error", text: e instanceof ApiError ? e.message : "Freigabe fehlgeschlagen." });
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
      setFlash({ type: "error", text: e instanceof ApiError ? e.message : "Ablehnung fehlgeschlagen." });
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
      setFlash({ type: "error", text: e instanceof ApiError ? e.message : "Export fehlgeschlagen." });
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

  // Anzeige-Objekt = Original überlagert mit lokalen Korrekturen.
  const view: InvoiceDetail = { ...detail, ...overrides };
  const pflicht = view.validierung?.pflichtangaben ?? [];
  const anomalien = view.anomalien ?? [];
  const summeOk = Math.abs((view.netto || 0) + (view.ust_betrag || 0) - (view.betrag || 0)) <= 0.01;
  const confidence = computeConfidence(view, { supplierKnown: knownSuppliers.has(view.lieferant) });

  const startEdit = () => {
    setForm({
      lieferant: view.lieferant ?? "",
      rechnungsnummer: view.rechnungsnummer ?? "",
      datum: view.datum ?? "",
      betrag: String(view.betrag ?? ""),
      netto: String(view.netto ?? ""),
      ust_betrag: String(view.ust_betrag ?? ""),
      ust_satz: String(view.ust_satz ?? ""),
      iban: view.iban ?? "",
      ust_id: view.ust_id ?? "",
    });
    setEditing(true);
  };

  const saveEdit = () => {
    // Hinweis: Lokale Übernahme — persistiert erst, wenn das Backend einen
    // PUT /invoices/{id}-Endpoint bereitstellt.
    setOverrides((prev) => ({
      ...prev,
      lieferant: form.lieferant,
      rechnungsnummer: form.rechnungsnummer,
      datum: form.datum,
      betrag: Number(form.betrag) || 0,
      netto: Number(form.netto) || 0,
      ust_betrag: Number(form.ust_betrag) || 0,
      ust_satz: Number(form.ust_satz) || 0,
      iban: form.iban,
      ust_id: form.ust_id,
    }));
    setEditing(false);
    setFlash({ type: "success", text: "Felder aktualisiert." });
  };

  const startEditK = () => {
    setFormK({
      konto: view.kontierung?.konto ?? "",
      gegenkonto: view.kontierung?.gegenkonto ?? "",
      steuerschluessel: view.kontierung?.steuerschluessel ?? "",
    });
    setEditingK(true);
  };

  const saveEditK = () => {
    setOverrides((prev) => ({ ...prev, kontierung: { ...formK } }));
    setEditingK(false);
    setFlash({ type: "success", text: "Kontierung aktualisiert." });
  };

  const setFormField = (k: string) => (v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="fc-fade-in pb-6">
      {flash && <Toast type={flash.type} text={flash.text} onClose={() => setFlash(null)} />}

      {BackLink}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1a1a2e]">
            Rechnung {view.rechnungsnummer || "—"}
          </h1>
          <p className="mt-1.5 text-sm text-[#64748b]">
            {view.lieferant || "—"} · {dateDE(view.datum)}
          </p>
          <div className="mt-3">
            <StatusBadge status={view.status} />
          </div>
        </div>
        <div className="shrink-0 rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-3 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
          <ConfidenceRing result={confidence} size={108} />
        </div>
      </div>

      {/* Split-View: PDF links (sticky) · Felder rechts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* PDF */}
        <section className={`${CARD} lg:sticky lg:top-6 lg:self-start`}>
          <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Originaldokument</h2>
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title={`Rechnung ${view.rechnungsnummer || view.id} — PDF-Vorschau`}
              className="h-[75vh] w-full rounded-xl border border-[rgba(0,56,86,0.08)] bg-white"
            />
          ) : (
            <div className="flex h-[75vh] flex-col items-center justify-center rounded-xl border border-dashed border-[rgba(0,56,86,0.15)] bg-[#faf9f7] p-10 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#003856]/5 text-[#003856]">
                <FileText className="h-8 w-8" />
              </div>
              <p className="text-base font-semibold text-[#1a1a2e]">Dokument</p>
              <p className="mt-1.5 max-w-xs text-sm text-[#64748b]">
                Die Originaldatei wird hier angezeigt, sobald sie verfügbar ist.
              </p>
            </div>
          )}
        </section>

        {/* Felder */}
        <section className={CARD}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#1a1a2e]">Extrahierte Felder</h2>
            {!editing ? (
              <button
                onClick={startEdit}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-[#003856] transition hover:bg-[#003856]/5 active:scale-95"
              >
                <Pencil className="h-4 w-4" />
                Korrigieren
              </button>
            ) : null}
          </div>

          {editing ? (
            <div>
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <EditField label="Lieferant" value={form.lieferant} onChange={setFormField("lieferant")} />
                <EditField label="Rechnungsnr." value={form.rechnungsnummer} onChange={setFormField("rechnungsnummer")} />
                <EditField label="Datum" value={form.datum} onChange={setFormField("datum")} />
                <EditField label="Betrag" type="number" value={form.betrag} onChange={setFormField("betrag")} />
                <EditField label="Netto" type="number" value={form.netto} onChange={setFormField("netto")} />
                <EditField label="USt-Betrag" type="number" value={form.ust_betrag} onChange={setFormField("ust_betrag")} />
                <EditField label="USt-Satz (%)" type="number" value={form.ust_satz} onChange={setFormField("ust_satz")} />
                <EditField label="IBAN" value={form.iban} onChange={setFormField("iban")} />
                <EditField label="USt-ID" value={form.ust_id} onChange={setFormField("ust_id")} />
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={saveEdit}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 font-medium text-white transition-all hover:bg-[#002a42] active:scale-95"
                >
                  <Save className="h-4 w-4" />
                  Speichern
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-xl px-5 py-2.5 font-medium text-[#64748b] transition hover:bg-[#faf9f7] active:scale-95"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <dl>
              <Field label="Lieferant" value={view.lieferant} />
              <Field label="Rechnungsnr." value={view.rechnungsnummer} />
              <Field label="Datum" value={dateDE(view.datum)} />
              <Field label="Betrag" value={eur(view.betrag, view.waehrung)} />
              <Field label="Netto" value={eur(view.netto, view.waehrung)} />
              <Field label={`USt-Betrag (${pct(view.ust_satz)})`} value={eur(view.ust_betrag, view.waehrung)} />
              <Field label="IBAN" value={view.iban} />
              <Field label="USt-ID" value={view.ust_id} />
            </dl>
          )}
        </section>
      </div>

      {/* Tabs */}
      <div className="mt-6 rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
        <div className="flex gap-1 border-b border-[rgba(0,56,86,0.08)] p-2">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setActiveTab(t.value)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition active:scale-95 ${
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
                <ValidRow label="IBAN" mono={view.iban} ok={!!view.validierung?.iban_valid} />
                <ValidRow label="USt-ID" mono={view.ust_id} ok={!!view.validierung?.ustid_valid} />
              </dl>

              {/* Betragscheck */}
              <div
                className={`mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
                  summeOk
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {summeOk ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {summeOk ? (
                  <span>Netto + USt = Brutto</span>
                ) : (
                  <span>
                    Summen stimmen nicht überein: {eur(view.netto, view.waehrung)} +{" "}
                    {eur(view.ust_betrag, view.waehrung)} ≠ {eur(view.betrag, view.waehrung)}
                  </span>
                )}
              </div>

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
                            <CheckCircle2 className="fc-pop h-4 w-4 shrink-0 text-emerald-600" />
                          ) : (
                            <XCircle className="fc-pop h-4 w-4 shrink-0 text-red-600" />
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
            <div>
              {editingK ? (
                <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
                  <EditField label="Konto" value={formK.konto} onChange={(v) => setFormK((p) => ({ ...p, konto: v }))} />
                  <EditField label="Gegenkonto" value={formK.gegenkonto} onChange={(v) => setFormK((p) => ({ ...p, gegenkonto: v }))} />
                  <EditField label="Steuerschlüssel" value={formK.steuerschluessel} onChange={(v) => setFormK((p) => ({ ...p, steuerschluessel: v }))} />
                </div>
              ) : (
                <div>
                  <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                    <div className="flex-1 rounded-xl border border-[rgba(0,56,86,0.08)] bg-[#faf9f7] p-4 text-center">
                      <p className="text-xs font-medium uppercase tracking-wider text-[#64748b]">Konto</p>
                      <p className="mt-1.5 text-xl font-bold text-[#003856]">{view.kontierung?.konto || "—"}</p>
                    </div>
                    <ArrowRight className="mx-auto h-5 w-5 shrink-0 rotate-90 text-[#c8985a] sm:rotate-0" />
                    <div className="flex-1 rounded-xl border border-[rgba(0,56,86,0.08)] bg-[#faf9f7] p-4 text-center">
                      <p className="text-xs font-medium uppercase tracking-wider text-[#64748b]">Gegenkonto</p>
                      <p className="mt-1.5 text-xl font-bold text-[#003856]">{view.kontierung?.gegenkonto || "—"}</p>
                    </div>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#c8985a]/15 px-3 py-1.5 text-sm font-semibold text-[#8a6526]">
                    Steuerschlüssel: {view.kontierung?.steuerschluessel || "—"}
                  </div>
                </div>
              )}

              <div className="mt-5 flex gap-2">
                {editingK ? (
                  <>
                    <button
                      onClick={saveEditK}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 font-medium text-white transition-all hover:bg-[#002a42] active:scale-95"
                    >
                      <Save className="h-4 w-4" />
                      Speichern
                    </button>
                    <button
                      onClick={() => setEditingK(false)}
                      className="rounded-xl px-5 py-2.5 font-medium text-[#64748b] transition hover:bg-[#faf9f7] active:scale-95"
                    >
                      Abbrechen
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setFlash({ type: "success", text: "Kontierung übernommen." })}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Kontierung übernehmen
                    </button>
                    <button
                      onClick={startEditK}
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium text-[#003856] transition hover:bg-[#003856]/5 active:scale-95"
                    >
                      <Pencil className="h-4 w-4" />
                      Korrigieren
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "anomalien" && (
            <div>
              {anomalien.length === 0 ? (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                  Keine Auffälligkeiten erkannt.
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {anomalien.map((a, i) => {
                    const text = typeof a === "string" ? a : a.beschreibung || a.typ || "Anomalie";
                    const typ = typeof a === "string" ? "Anomalie" : a.typ || "Anomalie";
                    const schwere = typeof a === "string" ? undefined : a.schwere;
                    const severe =
                      schwere && ["hoch", "high", "kritisch", "critical"].includes(schwere.toLowerCase());
                    return (
                      <li
                        key={i}
                        className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${
                          severe
                            ? "border-red-200 bg-red-50 text-red-800"
                            : "border-amber-200 bg-amber-50 text-amber-800"
                        }`}
                      >
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <div>
                          <p className="font-semibold">{typ}</p>
                          {typeof a !== "string" && a.beschreibung && <p>{text}</p>}
                          {typeof a === "string" && <p>{text}</p>}
                          {schwere && (
                            <span
                              className={`mt-1 inline-block rounded-md px-1.5 py-0.5 text-xs font-semibold uppercase ${
                                severe ? "bg-red-100" : "bg-amber-100"
                              }`}
                            >
                              {schwere}
                            </span>
                          )}
                        </div>
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
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
        >
          {actionBusy === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          Ablehnen
        </button>
        <button
          onClick={handleApprove}
          disabled={actionBusy !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
        >
          {actionBusy === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Freigeben
        </button>
        <button
          onClick={handleExport}
          disabled={actionBusy !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 font-medium text-white transition-all hover:bg-[#002a42] active:scale-95 disabled:opacity-50"
        >
          {actionBusy === "export" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Exportieren
        </button>
      </div>
    </div>
  );
}
