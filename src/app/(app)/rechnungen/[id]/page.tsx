"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
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
  PiggyBank,
  History,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Cpu,
  Upload,
  Landmark,
  CreditCard,
  Workflow,
} from "lucide-react";
import { flowcheckApi, ApiError, API_BASE, getToken, type InvoiceDetail } from "@/lib/api-client";
import { eur, dateDE, pct } from "@/lib/format";
import { computeConfidence } from "@/lib/confidence";
import { findDuplicate, type DuplicateMatch } from "@/lib/duplicate";
import { parseSkonto, type SkontoInfo } from "@/lib/skonto";
import {
  getKontierungMemory,
  recordKontierung,
  type KontierungMemory,
} from "@/lib/kontierungMemory";
import { pushRecent } from "@/lib/recents";
import StatusBadge from "@/components/StatusBadge";
import ConfidenceRing from "@/components/ConfidenceRing";
import ConfidenceBreakdown from "@/components/ConfidenceBreakdown";
import Toast from "@/components/Toast";
import { LoadingState, ErrorState } from "@/components/States";
import { recordFeedback, getFeedbackFor, getAccuracy } from "@/lib/kiFeedback";
import { isPaid } from "@/lib/payments";

type Tab = "validierung" | "kontierung" | "anomalien" | "ki" | "fluss";
type Flash = { type: "success" | "error"; text: string } | null;

const CARD =
  "rounded-2xl bg-white border border-[rgba(0,56,86,0.08)] shadow-[0_1px_3px_rgba(0,56,86,0.06)] p-6";
const INPUT =
  "w-full rounded-xl border border-[rgba(0,56,86,0.12)] px-3 py-2 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20";

const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: "validierung", label: "Validierung", icon: <ShieldCheck className="h-4 w-4" /> },
  { value: "kontierung", label: "Kontierung", icon: <Calculator className="h-4 w-4" /> },
  { value: "anomalien", label: "Anomalien", icon: <AlertTriangle className="h-4 w-4" /> },
  { value: "ki", label: "KI-Analyse", icon: <Sparkles className="h-4 w-4" /> },
  { value: "fluss", label: "Dokumentenfluss", icon: <Workflow className="h-4 w-4" /> },
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
  const [supplierCounts, setSupplierCounts] = useState<Map<string, number>>(new Map());
  const [breakdownOverride, setBreakdownOverride] = useState<boolean | null>(null);
  const [dupMatch, setDupMatch] = useState<DuplicateMatch | null>(null);
  const [dupIgnored, setDupIgnored] = useState(false);
  const [skonto, setSkonto] = useState<SkontoInfo | null>(null);
  const [kontMemory, setKontMemory] = useState<KontierungMemory | null>(null);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [accuracy, setAccuracy] = useState<{ pct: number; count: number }>({ pct: 0, count: 0 });

  // Lieferanten-Historie für den Konfidenz-Score (Name → Anzahl Rechnungen).
  useEffect(() => {
    flowcheckApi
      .lieferanten()
      .then((r) => {
        const m = new Map<string, number>();
        (r.items || []).forEach((l) => m.set(l.name, l.anzahl_rechnungen));
        setSupplierCounts(m);
      })
      .catch(() => setSupplierCounts(new Map()));
  }, []);

  // Intelligenz pro Beleg: Dublettenprüfung (gleicher Lieferant), Skonto, Kontierungs-Historie.
  useEffect(() => {
    if (!detail) return;
    let cancelled = false;
    const now = Date.now();
    const sk = parseSkonto(detail.zahlungsbedingungen, detail.datum, detail.betrag, now);
    const mem = getKontierungMemory(detail.lieferant);
    flowcheckApi
      .lieferant(detail.lieferant)
      .then((d) => {
        if (cancelled) return;
        setDupMatch(findDuplicate(detail, d.rechnungen || []));
      })
      .catch(() => {
        if (!cancelled) setDupMatch(null);
      })
      .finally(() => {
        if (cancelled) return;
        setSkonto(sk);
        setKontMemory(mem);
        setFeedback(getFeedbackFor(detail.id));
        setAccuracy(getAccuracy());
      });
    return () => {
      cancelled = true;
    };
  }, [detail]);

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

  // Präziser Seitentitel + "zuletzt bearbeitet"-Eintrag.
  useEffect(() => {
    if (!detail) return;
    if (detail.rechnungsnummer) document.title = `${detail.rechnungsnummer} — FlowCheck AI+`;
    pushRecent({
      id: detail.id,
      label: `${detail.lieferant || "Rechnung"} · ${detail.rechnungsnummer || `#${detail.id}`}`,
    });
  }, [detail]);

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
  const supplierCount = supplierCounts.get(view.lieferant) ?? 0;
  const kontFromHistory =
    !!kontMemory && !!view.kontierung?.konto && kontMemory.konto === view.kontierung.konto;
  const activeDup = dupIgnored ? null : dupMatch;
  const confidence = computeConfidence(view, {
    supplierKnown: supplierCount > 1,
    supplierCount,
    kontierungHistoryCount: kontFromHistory ? kontMemory?.count : 0,
    duplicate: activeDup,
  });
  // Breakdown auto-offen wenn Score < 90 %, manuell per Ring-Klick umschaltbar.
  const breakdownOpen = breakdownOverride ?? confidence.score < 90;

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
    // Smart-Learning: Kontierung für diesen Lieferanten merken.
    recordKontierung(view.lieferant, formK);
    setKontMemory(getKontierungMemory(view.lieferant));
    setFlash({ type: "success", text: "Kontierung gespeichert & für künftige Rechnungen gemerkt." });
  };

  const setFormField = (k: string) => (v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const giveFeedback = (ok: boolean) => {
    recordFeedback(view.id, ok);
    setFeedback(ok);
    setAccuracy(getAccuracy());
    if (ok) {
      setFlash({ type: "success", text: "Danke! Extraktion als korrekt bestätigt." });
    } else {
      startEdit();
      setFlash({ type: "success", text: "Bitte korrigieren Sie die Felder rechts." });
    }
  };

  const onConfidenceAction = (action: "fields" | "kontierung") => {
    if (action === "kontierung") {
      setActiveTab("kontierung");
      startEditK();
    } else {
      startEdit();
    }
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          <ConfidenceRing
            result={confidence}
            size={108}
            onClick={() => setBreakdownOverride(!breakdownOpen)}
          />
        </div>
      </div>

      {/* Duplikat-Warnung */}
      {activeDup && (
        <div className="mb-6 rounded-2xl border-l-4 border-amber-400 bg-amber-50 p-5">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="font-semibold">Mögliches Duplikat erkannt</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-white/70 p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-amber-700">Diese Rechnung</p>
              <p className="mt-1 font-semibold text-[#1a1a2e]">{view.rechnungsnummer || `#${view.id}`}</p>
              <p className="text-sm text-[#64748b]">{dateDE(view.datum)}</p>
              <p className="text-sm font-medium text-[#1a1a2e]">{eur(view.betrag, view.waehrung)}</p>
            </div>
            <div className="rounded-xl bg-white/70 p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-amber-700">Verdächtige Rechnung</p>
              <p className="mt-1 font-semibold text-[#1a1a2e]">{activeDup.rechnungsnummer || `#${activeDup.id}`}</p>
              <p className="text-sm text-[#64748b]">{dateDE(activeDup.datum)}</p>
              <p className="text-sm font-medium text-[#1a1a2e]">{eur(activeDup.betrag, activeDup.waehrung)}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/rechnungen/${activeDup.id}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-amber-700 active:scale-95"
            >
              Vergleichen
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setDupIgnored(true)}
              className="rounded-xl border border-amber-300 px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100 active:scale-95"
            >
              Kein Duplikat — Ignorieren
            </button>
          </div>
        </div>
      )}

      {/* Skonto-Reminder */}
      {skonto && skonto.tageVerbleibend >= 0 && (
        <div className="mb-6 rounded-2xl border-l-4 border-emerald-400 bg-emerald-50 p-5">
          <div className="flex items-center gap-2 text-emerald-800">
            <PiggyBank className="h-5 w-5 shrink-0" />
            <p className="font-semibold">Skonto verfügbar!</p>
          </div>
          <p className="mt-2 text-sm text-emerald-800">
            Bei Zahlung bis {dateDE(new Date(skonto.fristMs).toISOString())} sparen Sie{" "}
            <span className="font-bold">
              {skonto.prozent}% = {eur(skonto.ersparnis, view.waehrung)}
            </span>
            .
          </p>
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs text-emerald-800">
              <span>
                Verbleibend: {skonto.tageVerbleibend} {skonto.tageVerbleibend === 1 ? "Tag" : "Tage"}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100">
              <div
                className={`h-full rounded-full ${
                  skonto.tageVerbleibend > 5
                    ? "bg-emerald-500"
                    : skonto.tageVerbleibend >= 2
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${Math.max(5, Math.min(100, (skonto.tageVerbleibend / skonto.tage) * 100))}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => setFlash({ type: "success", text: "Rechnung zur Zahlung vorgemerkt." })}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95"
          >
            Zur Zahlung markieren
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Konfidenz-Aufschlüsselung */}
      {breakdownOpen && (
        <div className="mb-6">
          <ConfidenceBreakdown result={confidence} onAction={onConfidenceAction} />
        </div>
      )}

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
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-lg bg-[#c8985a]/15 px-3 py-1.5 text-sm font-semibold text-[#8a6526]">
                      Steuerschlüssel: {view.kontierung?.steuerschluessel || "—"}
                    </span>
                    {kontFromHistory && kontMemory && (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700"
                        title={`Basierend auf ${kontMemory.count} vorherigen Rechnungen von ${view.lieferant}`}
                      >
                        <History className="h-3.5 w-3.5" />
                        Aus Historie
                      </span>
                    )}
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

          {activeTab === "ki" && (
            <div className="space-y-6">
              {/* Extraktions-Herkunft */}
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#64748b]">
                  Extraktion &amp; Validierung
                </p>
                <ul className="space-y-2.5">
                  {[
                    { label: "Lieferant", value: view.lieferant, ok: undefined as boolean | undefined, note: "Aus Kopfbereich des Dokuments extrahiert." },
                    { label: "IBAN", value: view.iban, ok: !!view.validierung?.iban_valid, note: view.validierung?.iban_valid ? "IBAN Mod-97 Prüfziffer korrekt." : "IBAN nicht verifizierbar." },
                    { label: "USt-ID", value: view.ust_id, ok: !!view.validierung?.ustid_valid, note: view.validierung?.ustid_valid ? "USt-IdNr.-Format korrekt." : "USt-IdNr. nicht verifizierbar." },
                    { label: "Betrag", value: eur(view.betrag, view.waehrung), ok: summeOk, note: summeOk ? `Netto (${eur(view.netto, view.waehrung)}) + USt (${eur(view.ust_betrag, view.waehrung)}) = Brutto ✓` : "Summenprüfung fehlgeschlagen." },
                  ].map((f) => (
                    <li key={f.label} className="rounded-xl border border-[rgba(0,56,86,0.08)] bg-[#faf9f7] p-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-medium uppercase tracking-wider text-[#64748b]">{f.label}</span>
                        {f.ok !== undefined &&
                          (f.ok ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ))}
                      </div>
                      <p className="mt-1 font-medium text-[#1a1a2e]">{f.value || "—"}</p>
                      <p className="mt-1 font-mono text-xs text-[#64748b]">{f.note}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Modell-Info */}
              <div className="rounded-xl border border-[rgba(0,56,86,0.08)] bg-white p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-[#003856]" />
                  <p className="text-sm font-semibold text-[#1a1a2e]">Verarbeitung</p>
                </div>
                <dl className="space-y-1.5 font-mono text-xs text-[#64748b]">
                  <div className="flex justify-between gap-4">
                    <dt>Methode</dt>
                    <dd className="text-right text-[#1a1a2e]">KI-Extraktion (PDF/Scan) · Parser (XRechnung/ZUGFeRD)</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Pipeline</dt>
                    <dd className="text-right text-[#1a1a2e]">Dokument → Text → KI → JSON → Validierung</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Telemetrie (Tokens, Kosten, Dauer)</dt>
                    <dd className="text-right text-[#94a3b8]">vom Backend nicht übermittelt</dd>
                  </div>
                </dl>
              </div>

              {/* Feedback-Loop */}
              <div className="rounded-xl border border-[rgba(0,56,86,0.08)] bg-white p-4">
                <p className="text-sm font-semibold text-[#1a1a2e]">War diese Extraktion korrekt?</p>
                {feedback === null ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => giveFeedback(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Ja, alles richtig
                    </button>
                    <button
                      onClick={() => giveFeedback(false)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 active:scale-95"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Nein, Fehler korrigieren
                    </button>
                  </div>
                ) : (
                  <p className={`mt-2 inline-flex items-center gap-1.5 text-sm font-medium ${feedback ? "text-emerald-700" : "text-amber-700"}`}>
                    {feedback ? <ThumbsUp className="h-4 w-4" /> : <ThumbsDown className="h-4 w-4" />}
                    {feedback ? "Als korrekt bestätigt." : "Zur Korrektur markiert."}
                  </p>
                )}
                {accuracy.count > 0 && (
                  <p className="mt-3 border-t border-[rgba(0,56,86,0.06)] pt-3 text-xs text-[#64748b]">
                    KI-Genauigkeit: <span className="font-semibold text-[#003856]">{accuracy.pct}%</span> (basierend auf{" "}
                    {accuracy.count} bewerteten Rechnungen)
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "fluss" && (
            (() => {
              const st = (view.status || "").toLowerCase();
              const paid = isPaid(view.id);
              type SStatus = "done" | "current" | "pending" | "error";
              const steps: { icon: typeof Upload; label: string; date?: string; status: SStatus }[] = [
                { icon: Upload, label: "Upload", date: view.created_at, status: "done" },
                { icon: Sparkles, label: "KI-Extraktion", date: view.created_at, status: st === "neu" ? "current" : "done" },
                { icon: ShieldCheck, label: "Validierung", date: view.created_at, status: st === "neu" ? "pending" : "done" },
                {
                  icon: Check,
                  label: "Freigabe",
                  date: view.approved_at || view.rejected_at,
                  status: st === "abgelehnt" ? "error" : st === "freigegeben" || st === "exportiert" ? "done" : st === "verarbeitet" ? "current" : "pending",
                },
                {
                  icon: Landmark,
                  label: "DATEV-Export",
                  date: view.exported_at,
                  status: st === "exportiert" ? "done" : st === "freigegeben" ? "current" : "pending",
                },
                { icon: CreditCard, label: "Zahlung", date: view.paid_at, status: paid ? "done" : "pending" },
              ];
              const circleCls: Record<SStatus, string> = {
                done: "ring-2 ring-emerald-500 bg-emerald-50 text-emerald-600",
                current: "ring-2 ring-blue-500 bg-blue-50 text-blue-600",
                pending: "ring-2 ring-stone-300 bg-stone-50 text-stone-400",
                error: "ring-2 ring-red-500 bg-red-50 text-red-600",
              };
              const statusText: Record<SStatus, string> = {
                done: "Abgeschlossen",
                current: "In Bearbeitung",
                pending: "Ausstehend",
                error: "Abgelehnt",
              };
              const statusColor: Record<SStatus, string> = {
                done: "text-emerald-600",
                current: "text-blue-600",
                pending: "text-[#94a3b8]",
                error: "text-red-600",
              };
              return (
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  {steps.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <Fragment key={s.label}>
                        {i > 0 && (
                          <div
                            className={`hidden h-0.5 flex-1 md:block ${
                              steps[i - 1].status === "done" ? "bg-emerald-500" : "bg-stone-300"
                            }`}
                          />
                        )}
                        <div className="flex items-center gap-3 md:flex-col md:gap-2 md:text-center">
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${circleCls[s.status]}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#1a1a2e]">{s.label}</p>
                            <p className="text-xs text-[#64748b]">{s.date ? dateDE(s.date) : "—"}</p>
                            <p className={`text-xs font-medium ${statusColor[s.status]}`}>{statusText[s.status]}</p>
                          </div>
                        </div>
                      </Fragment>
                    );
                  })}
                </div>
              );
            })()
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
