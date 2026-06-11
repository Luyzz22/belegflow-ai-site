"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  PartyPopper,
  Keyboard,
} from "lucide-react";
import {
  flowcheckApi,
  API_BASE,
  getToken,
  type InvoiceListItem,
  type InvoiceDetail,
} from "@/lib/api-client";
import { eur, dateDE, pct } from "@/lib/format";
import { computeConfidence } from "@/lib/confidence";
import ConfidenceRing from "@/components/ConfidenceRing";
import Confetti from "@/components/Confetti";
import { useToast } from "@/components/toast/ToastProvider";
import { LoadingState, EmptyState } from "@/components/States";

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-stone-500">
      {children}
    </kbd>
  );
}

export default function ReviewPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [items, setItems] = useState<InvoiceListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [knownSuppliers, setKnownSuppliers] = useState<Set<string>>(new Set());

  const [idx, setIdx] = useState(0);
  const [detail, setDetail] = useState<InvoiceDetail | null>(null);
  const [pdf, setPdf] = useState<{ id: number; url: string } | null>(null);
  const [pdfTried, setPdfTried] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [grund, setGrund] = useState("");

  const [decided, setDecided] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const itemStart = useRef<number>(0);

  // Liste + Lieferanten laden.
  useEffect(() => {
    flowcheckApi
      .invoices("status=verarbeitet")
      .then((r) => setItems((r.items || []).filter((i) => i.status === "verarbeitet")))
      .catch(() => setItems([]))
      .finally(() => setLoadingList(false));
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

  const current = items[idx];
  const currentId = current?.id;

  // Detail des aktuellen Belegs laden.
  useEffect(() => {
    if (!current) return;
    let cancelled = false;
    flowcheckApi
      .invoice(current.id)
      .then((d) => {
        if (cancelled) return;
        setDetail(d);
        itemStart.current = Date.now();
      })
      .catch(() => {
        if (!cancelled) setDetail(null);
      });
    return () => {
      cancelled = true;
    };
  }, [current]);

  // PDF des aktuellen Belegs laden — bei jedem ID-Wechsel neu (altes Blob revoken).
  useEffect(() => {
    if (currentId == null) return;
    let cancelled = false;
    let obj: string | null = null;
    const token = getToken();
    fetch(`${API_BASE}/invoices/${currentId}/pdf`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (cancelled || !blob) return;
        obj = URL.createObjectURL(blob);
        setPdf({ id: currentId, url: obj });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setPdfTried(currentId);
      });
    return () => {
      cancelled = true;
      if (obj) URL.revokeObjectURL(obj);
    };
  }, [currentId]);

  const ready = !!detail && !!current && detail.id === current.id;
  const confidence = useMemo(
    () => (ready && detail ? computeConfidence(detail, { supplierKnown: knownSuppliers.has(detail.lieferant) }) : null),
    [ready, detail, knownSuppliers]
  );

  const done = !loadingList && items.length > 0 && idx >= items.length;
  const avg = times.length ? times.reduce((s, v) => s + v, 0) / times.length : 0;

  const advance = useCallback(() => {
    setLeaving(true);
    window.setTimeout(() => {
      setIdx((i) => i + 1);
      setLeaving(false);
    }, 280);
  }, []);

  const record = useCallback(() => {
    const secs = (Date.now() - (itemStart.current || Date.now())) / 1000;
    setTimes((t) => [...t, secs]);
    setDecided((d) => d + 1);
  }, []);

  const approve = useCallback(() => {
    if (!ready || !detail) return;
    const id = detail.id;
    const label = detail.rechnungsnummer || `#${id}`;
    // Verzögerte Ausführung → echtes "Rückgängig" innerhalb von 5 s.
    const commit = window.setTimeout(() => {
      void flowcheckApi.approve(id).catch(() => {});
    }, 5000);
    addToast({
      type: "success",
      text: `Rechnung ${label} freigegeben`,
      undo: { onUndo: () => window.clearTimeout(commit) },
    });
    record();
    advance();
  }, [ready, detail, addToast, record, advance]);

  // Öffnet das (non-blocking) Ablehnen-Modal — kein window.prompt mehr.
  const reject = useCallback(() => {
    if (!ready || !detail) return;
    setGrund("");
    setRejectOpen(true);
  }, [ready, detail]);

  const doReject = useCallback(
    (withGrund: boolean) => {
      if (!detail) return;
      const id = detail.id;
      const reason = withGrund ? grund.trim() || "Kein Grund angegeben" : "Kein Grund angegeben";
      void flowcheckApi.reject(id, reason).catch(() => {});
      addToast({ type: "warning", text: `Rechnung ${detail.rechnungsnummer || `#${id}`} abgelehnt` });
      setRejectOpen(false);
      setGrund("");
      record();
      advance();
    },
    [detail, grund, addToast, record, advance]
  );

  const skip = useCallback(() => {
    if (leaving) return;
    advance();
  }, [leaving, advance]);

  const prev = useCallback(() => {
    setIdx((i) => Math.max(0, i - 1));
  }, []);

  const exportCmd = useCallback(() => {
    void flowcheckApi
      .datevPreview()
      .then(() => addToast({ type: "info", text: "DATEV-Export vorbereitet." }))
      .catch(() => addToast({ type: "error", text: "DATEV-Export fehlgeschlagen." }));
  }, [addToast]);

  const exit = useCallback(() => router.push("/dashboard"), [router]);

  // Keyboard-Shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      // Bei offenem Ablehnen-Modal nur Esc (schließen) erlauben.
      if (rejectOpen) {
        if (e.key === "Escape") setRejectOpen(false);
        return;
      }
      const k = e.key.toLowerCase();
      if (k === "f") approve();
      else if (k === "a") reject();
      else if (e.key === "ArrowRight" || k === "j") skip();
      else if (e.key === "ArrowLeft" || k === "k") prev();
      else if (k === "e") exportCmd();
      else if (e.key === "Escape") exit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [approve, reject, skip, prev, exportCmd, exit, rejectOpen]);

  // ── Render ──────────────────────────────────────────────
  if (loadingList) return <LoadingState label="Rechnungen werden geladen …" />;

  if (items.length === 0) {
    return (
      <div className="fc-fade-in">
        <EmptyState
          icon={<CheckCircle2 className="h-6 w-6" />}
          title="Keine Rechnungen zur Prüfung"
          description="Es liegen aktuell keine Rechnungen mit Status „verarbeitet“ vor."
          action={
            <Link
              href="/upload"
              className="rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95"
            >
              Rechnung hochladen
            </Link>
          }
        />
      </div>
    );
  }

  if (done) {
    return (
      <div className="fc-fade-in relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden text-center">
        <Confetti />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <PartyPopper className="h-10 w-10" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-[#1a1a2e]">Alle erledigt! 🎉</h1>
        <p className="mt-2 text-[#64748b]">
          {decided} {decided === 1 ? "Rechnung" : "Rechnungen"} geprüft
          {avg > 0 && ` · Ø ${avg.toFixed(1)} Sekunden pro Rechnung`}
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95"
          >
            Zum Dashboard
          </Link>
          <Link
            href="/rechnungen"
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-[#003856] transition hover:bg-[#003856]/5 active:scale-95"
          >
            Alle Rechnungen
          </Link>
        </div>
      </div>
    );
  }

  const progress = Math.min(idx, items.length);
  const failing = confidence?.checks.filter((c) => !c.ok) ?? [];

  return (
    <div className="fc-fade-in">
      {/* Kopf: Fortschritt + Timer + Exit */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#ffb900]/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#8a6526]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ffb900]" />
            Review-Modus
          </span>
          <span className="text-sm text-[#64748b]">
            {progress + 1} von {items.length} Rechnungen
          </span>
        </div>
        <div className="flex items-center gap-4">
          {avg > 0 && (
            <span className="hidden text-sm text-[#64748b] sm:inline">
              Ø {avg.toFixed(1)} s / Rechnung
            </span>
          )}
          <button
            onClick={exit}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-[#64748b] transition hover:bg-[#faf9f7] hover:text-[#1a1a2e] active:scale-95"
          >
            <X className="h-4 w-4" />
            Verlassen
            <Kbd>Esc</Kbd>
          </button>
        </div>
      </div>

      {/* Fortschrittsbalken */}
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-[#003856]/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#003856] to-[#c8985a] transition-[width] duration-300"
          style={{ width: `${(progress / items.length) * 100}%` }}
        />
      </div>

      <div
        key={current?.id}
        className={leaving ? "fc-slide-out-left" : "fc-slide-in-right"}
      >
        {!ready ? (
          <LoadingState label="Beleg wird geladen …" />
        ) : detail && confidence ? (
          <>
            {/* Konfidenz-Banner */}
            <div
              className={`mb-5 flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium ${
                confidence.tier === "high"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : confidence.tier === "medium"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {confidence.tier === "high" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0" />
              )}
              <span>
                KI-Konfidenz: {confidence.score}% —{" "}
                {confidence.tier === "high"
                  ? "Alle Prüfungen bestanden"
                  : failing.map((f) => f.label).slice(0, 2).join(", ") + " — manuell prüfen"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* PDF */}
              <section className="rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-5 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
                {pdf && pdf.id === detail.id ? (
                  <iframe
                    src={pdf.url}
                    title={`Rechnung ${detail.rechnungsnummer || detail.id}`}
                    className="h-[60vh] w-full rounded-xl border border-[rgba(0,56,86,0.08)] bg-white"
                  />
                ) : pdfTried !== detail.id ? (
                  <div className="flex h-[60vh] flex-col items-center justify-center rounded-xl border border-[rgba(0,56,86,0.08)] bg-[#faf9f7]">
                    <Loader2 className="h-8 w-8 animate-spin text-[#003856]/40" />
                    <p className="mt-3 text-xs text-[#64748b]">Dokument wird geladen …</p>
                  </div>
                ) : (
                  <div className="flex h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-[rgba(0,56,86,0.15)] bg-[#faf9f7] text-center">
                    <FileText className="mb-3 h-10 w-10 text-[#003856]/40" />
                    <p className="text-sm font-medium text-[#1a1a2e]">Dokument</p>
                    <p className="mt-1 text-xs text-[#64748b]">Vorschau nicht verfügbar.</p>
                  </div>
                )}
              </section>

              {/* Daten + Konfidenz */}
              <section className="rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#1a1a2e]">{detail.lieferant || "—"}</h2>
                    <p className="mt-0.5 text-sm text-[#64748b]">
                      {detail.rechnungsnummer || "—"} · {dateDE(detail.datum)}
                    </p>
                  </div>
                  <ConfidenceRing result={confidence} size={104} />
                </div>

                <dl className="mt-4">
                  {[
                    ["Betrag", eur(detail.betrag, detail.waehrung)],
                    ["Netto", eur(detail.netto, detail.waehrung)],
                    [`USt (${pct(detail.ust_satz)})`, eur(detail.ust_betrag, detail.waehrung)],
                    ["IBAN", detail.iban || "—"],
                    ["USt-ID", detail.ust_id || "—"],
                    ["Kontierung", `${detail.kontierung?.konto || "—"} → ${detail.kontierung?.gegenkonto || "—"}`],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-4 border-b border-[rgba(0,56,86,0.06)] py-2.5 last:border-0"
                    >
                      <dt className="text-sm text-[#64748b]">{label}</dt>
                      <dd className="text-right text-sm font-medium text-[#1a1a2e]">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          </>
        ) : (
          <EmptyState title="Beleg konnte nicht geladen werden." />
        )}
      </div>

      {/* Aktionsleiste */}
      <div className="sticky bottom-4 mt-6 flex items-center justify-center gap-3">
        <button
          onClick={reject}
          disabled={!ready}
          className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3.5 font-semibold text-white shadow-lg transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
        >
          <X className="h-5 w-5" />
          Ablehnen
          <Kbd>A</Kbd>
        </button>
        <button
          onClick={skip}
          disabled={!ready}
          className="inline-flex items-center gap-2 rounded-2xl border border-[rgba(0,56,86,0.12)] bg-white px-5 py-3.5 font-medium text-[#003856] shadow-sm transition-all hover:bg-[#faf9f7] active:scale-95 disabled:opacity-50"
        >
          <ChevronRight className="h-5 w-5" />
          Überspringen
        </button>
        <button
          onClick={approve}
          disabled={!ready}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 font-semibold text-white shadow-lg transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
        >
          <Check className="h-5 w-5" />
          Freigeben
          <Kbd>F</Kbd>
        </button>
      </div>

      {/* Sekundäraktionen */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-[#94a3b8]">
        <button onClick={prev} disabled={idx === 0} className="inline-flex items-center gap-1 hover:text-[#003856] disabled:opacity-40">
          <ChevronLeft className="h-3.5 w-3.5" />
          Vorherige
        </button>
        <button onClick={exportCmd} className="inline-flex items-center gap-1 hover:text-[#003856]">
          <Download className="h-3.5 w-3.5" />
          Exportieren <Kbd>E</Kbd>
        </button>
        <span className="inline-flex items-center gap-1">
          <Keyboard className="h-3.5 w-3.5" />
          <Kbd>F</Kbd> Freigeben · <Kbd>A</Kbd> Ablehnen · <Kbd>→</Kbd> Nächste
        </span>
      </div>

      {/* Ablehnen-Modal (non-blocking, ersetzt window.prompt) */}
      {rejectOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRejectOpen(false)} />
          <div className="fc-scale-in relative w-full max-w-md rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-[#1a1a2e]">Rechnung ablehnen</h2>
            {detail && (
              <p className="mt-1 text-sm text-[#64748b]">
                {detail.lieferant} · {eur(detail.betrag, detail.waehrung)}
              </p>
            )}
            <label className="mt-4 block text-xs font-medium uppercase tracking-wider text-[#64748b]">
              Grund (optional)
            </label>
            <textarea
              value={grund}
              onChange={(e) => setGrund(e.target.value)}
              rows={3}
              autoFocus
              placeholder="z. B. Betrag weicht von Bestellung ab"
              className="mt-1.5 w-full rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
            />
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setRejectOpen(false)}
                className="rounded-xl px-5 py-2.5 font-medium text-[#64748b] transition hover:bg-[#faf9f7] active:scale-95"
              >
                Abbrechen
              </button>
              <button
                onClick={() => doReject(false)}
                className="rounded-xl border border-red-200 px-5 py-2.5 font-medium text-red-600 transition hover:bg-red-50 active:scale-95"
              >
                Ohne Grund ablehnen
              </button>
              <button
                onClick={() => doReject(true)}
                className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition-all hover:bg-red-700 active:scale-95"
              >
                Mit Grund ablehnen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
