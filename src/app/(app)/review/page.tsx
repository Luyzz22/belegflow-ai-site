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
import { computeConfidence, confidenceSummary } from "@/lib/confidence";
import ConfidenceRing from "@/components/ConfidenceRing";
import ConfidenceBreakdown from "@/components/ConfidenceBreakdown";
import Confetti from "@/components/Confetti";
import HelpTooltip from "@/components/HelpTooltip";
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
  const [supplierCounts, setSupplierCounts] = useState<Map<string, number>>(new Map());
  const [showBreakdown, setShowBreakdown] = useState(false);

  const [idx, setIdx] = useState(0);
  const [detail, setDetail] = useState<InvoiceDetail | null>(null);
  const [pdf, setPdf] = useState<{ id: number; url: string } | null>(null);
  const [pdfTried, setPdfTried] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [grund, setGrund] = useState("");
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

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
        const m = new Map<string, number>();
        (r.items || []).forEach((l) => m.set(l.name, l.anzahl_rechnungen));
        setSupplierCounts(m);
      })
      .catch(() => setSupplierCounts(new Map()));
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
  const confidence = useMemo(() => {
    if (!ready || !detail) return null;
    const count = supplierCounts.get(detail.lieferant) ?? 0;
    return computeConfidence(detail, { supplierKnown: count > 1, supplierCount: count });
  }, [ready, detail, supplierCounts]);

  const done = !loadingList && items.length > 0 && idx >= items.length;
  const avg = times.length ? times.reduce((s, v) => s + v, 0) / times.length : 0;

  // ⌀ Bearbeitungszeit für die Analytics-KPI persistieren.
  useEffect(() => {
    if (done && avg > 0) localStorage.setItem("flowcheck_review_avg", avg.toFixed(1));
  }, [done, avg]);

  const advance = useCallback(() => {
    setLeaving(true);
    setShowBreakdown(false);
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
    // Optimistic UI: sofort weiter, API verzögert im Hintergrund (5 s "Rückgängig").
    const commit = window.setTimeout(() => {
      void flowcheckApi.approve(id).catch(() => {
        addToast({ type: "error", text: `Freigabe für ${label} fehlgeschlagen` });
      });
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

  // Swipe-Gesten (mobil): rechts = freigeben, links = ablehnen.
  const onTouchStart = (e: React.TouchEvent) => {
    dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragStart.current) return;
    const dx = e.touches[0].clientX - dragStart.current.x;
    const dy = e.touches[0].clientY - dragStart.current.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      setDragging(true);
      setDragX(Math.max(-150, Math.min(150, dx)));
    }
  };
  const onTouchEnd = () => {
    if (dragX > 90) approve();
    else if (dragX < -90) reject();
    dragStart.current = null;
    setDragging(false);
    setDragX(0);
  };

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
  const summary = confidence ? confidenceSummary(confidence) : null;
  const issues = confidence?.checks.filter((c) => c.status !== "pass") ?? [];

  return (
    <div className="fc-fade-in">
      {/* Kopf: Fortschritt + Timer + Exit */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#ffb900]/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#8a6526]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ffb900]" />
            Review-Modus
          </span>
          <HelpTooltip text="Im Review-Modus prüfen und geben Sie Rechnungen einzeln frei — mit Tastenkürzeln in Sekunden." />
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
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={dragging ? { transform: `translateX(${dragX}px)`, transition: "none" } : undefined}
        className={`relative ${leaving ? "fc-slide-out-left" : "fc-slide-in-right"}`}
      >
        {/* Swipe-Hinweise (mobil) */}
        {dragging && (
          <>
            <span
              className={`pointer-events-none absolute left-3 top-3 z-20 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white transition-opacity sm:hidden ${dragX > 30 ? "opacity-100" : "opacity-0"}`}
            >
              Freigeben
            </span>
            <span
              className={`pointer-events-none absolute right-3 top-3 z-20 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-bold text-white transition-opacity sm:hidden ${dragX < -30 ? "opacity-100" : "opacity-0"}`}
            >
              Ablehnen
            </span>
          </>
        )}
        {!ready ? (
          <LoadingState label="Beleg wird geladen …" />
        ) : detail && confidence ? (
          <>
            {/* Konfidenz-Banner — Text aus den tatsächlichen Checks */}
            <div
              className={`mb-5 flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium ${
                summary?.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : summary?.tone === "warning"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {summary?.tone === "success" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0" />
              )}
              <span>
                KI-Konfidenz: {confidence.score}% — {summary?.text}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* PDF — auf Mobile ausgeblendet (nur Daten) */}
              <section className="hidden rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-5 shadow-[0_1px_3px_rgba(0,56,86,0.06)] lg:block">
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
                  <ConfidenceRing result={confidence} size={104} onClick={() => setShowBreakdown((s) => !s)} />
                </div>

                {/* Kompakte Issue-Chips + Expand */}
                {issues.length > 0 && (
                  <button
                    onClick={() => setShowBreakdown((s) => !s)}
                    className="mt-3 flex w-full flex-wrap items-center gap-1.5 rounded-xl border border-[rgba(0,56,86,0.08)] bg-[#faf9f7] px-3 py-2 text-left text-xs transition hover:bg-[#003856]/5"
                  >
                    {issues.map((c) => (
                      <span
                        key={c.id}
                        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium ${
                          c.status === "fail" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {c.status === "fail" ? "❌" : "⚠️"} {c.label}
                      </span>
                    ))}
                    <span className="ml-auto font-semibold text-[#003856]">
                      {showBreakdown ? "Weniger" : "Details"}
                    </span>
                  </button>
                )}

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

            {/* Volle Konfidenz-Aufschlüsselung: inline (Desktop) bzw. Bottom-Sheet (mobil) */}
            {showBreakdown && (
              <>
                <div className="mt-6 hidden sm:block">
                  <ConfidenceBreakdown result={confidence} />
                </div>
                <div className="fixed inset-0 z-[80] sm:hidden">
                  <div className="absolute inset-0 bg-black/50" onClick={() => setShowBreakdown(false)} />
                  <div className="fc-sheet-up absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-[#f8f6f3] p-4 pb-8">
                    <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-stone-300" />
                    <ConfidenceBreakdown result={confidence} />
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <EmptyState title="Beleg konnte nicht geladen werden." />
        )}
      </div>

      {/* Aktionsleiste */}
      <div className="sticky bottom-4 mt-6 flex items-center justify-center gap-2 sm:gap-3">
        <button
          onClick={reject}
          disabled={!ready}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-red-600 px-5 py-3.5 font-semibold text-white shadow-lg transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50 sm:px-6"
        >
          <X className="h-5 w-5" />
          Ablehnen
          <span className="hidden sm:inline-flex">
            <Kbd>A</Kbd>
          </span>
        </button>
        <button
          onClick={skip}
          disabled={!ready}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl border border-[rgba(0,56,86,0.12)] bg-white px-4 py-3.5 font-medium text-[#003856] shadow-sm transition-all hover:bg-[#faf9f7] active:scale-95 disabled:opacity-50 sm:px-5"
        >
          <ChevronRight className="h-5 w-5" />
          Überspringen
        </button>
        <button
          onClick={approve}
          disabled={!ready}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 font-semibold text-white shadow-lg transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 sm:px-6"
        >
          <Check className="h-5 w-5" />
          Freigeben
          <span className="hidden sm:inline-flex">
            <Kbd>F</Kbd>
          </span>
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
