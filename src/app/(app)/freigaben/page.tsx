"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, X, CheckCircle2, Loader2 } from "lucide-react";
import { flowcheckApi, ApiError, type Freigabe } from "@/lib/api-client";
import { notifyDataChanged } from "@/lib/events";
import { eur, dateDE } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import Toast from "@/components/Toast";
import { ErrorState, EmptyState, Skeleton } from "@/components/States";

type ToastState = { type: "success" | "error"; text: string } | null;

function FreigabeCard({
  f,
  busy,
  onApprove,
  onReject,
}: {
  f: Freigabe;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  const onStart = (e: React.TouchEvent) => {
    setDragging(true);
    startX.current = e.touches[0].clientX;
  };
  const onMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const d = e.touches[0].clientX - startX.current;
    setDx(Math.max(-120, Math.min(120, d)));
  };
  const onEnd = () => {
    setDragging(false);
    if (dx > 80) onApprove();
    else if (dx < -80) onReject();
    setDx(0);
  };

  const ref = f.rechnungsnummer || `RE #${f.invoice_id}`;
  const ageLabel = f.age_hours != null ? `${Math.round(f.age_hours)} h offen` : null;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Swipe-Hinweise */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-5">
        <span className={`text-emerald-600 transition-opacity ${dx > 20 ? "opacity-100" : "opacity-0"}`}>
          <Check className="h-6 w-6" />
        </span>
        <span className={`text-red-600 transition-opacity ${dx < -20 ? "opacity-100" : "opacity-0"}`}>
          <X className="h-6 w-6" />
        </span>
      </div>

      <div
        onTouchStart={onStart}
        onTouchMove={onMove}
        onTouchEnd={onEnd}
        style={{ transform: `translateX(${dx}px)`, transition: dragging ? "none" : "transform 0.25s ease" }}
        className={`fc-lift rounded-2xl border bg-white p-5 shadow-[0_1px_3px_rgba(0,56,86,0.06)] ${
          f.overdue ? "border-red-200 ring-1 ring-red-100" : "border-[rgba(0,56,86,0.08)]"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/rechnungen/${f.invoice_id}`}
            className="truncate font-semibold text-[#1a1a2e] transition hover:text-[#003856]"
          >
            {f.lieferant || "—"}
          </Link>
          {f.stufe && (
            <span className="shrink-0 rounded-lg bg-[#c8985a]/15 px-2 py-0.5 text-xs font-semibold text-[#8a6526]">
              {f.stufe}
            </span>
          )}
        </div>

        <p className="mt-3 text-2xl font-bold tabular-nums text-[#003856]">{eur(f.betrag)}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-[#64748b]">
          <span>{ref} · {dateDE(f.erstellt_am, true)}</span>
          {ageLabel && (
            <span
              className={`rounded px-1.5 py-0.5 font-semibold ${
                f.overdue ? "bg-red-50 text-red-700" : "bg-[#003856]/5 text-[#64748b]"
              }`}
            >
              {f.overdue ? "überfällig · " : ""}{ageLabel}
            </span>
          )}
        </p>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onApprove}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Freigeben
          </button>
          <button
            onClick={onReject}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 py-2.5 font-medium text-red-600 transition-all hover:bg-red-50 active:scale-95 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Ablehnen
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FreigabenPage() {
  const [items, setItems] = useState<Freigabe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);
  const [rejectFor, setRejectFor] = useState<Freigabe | null>(null);
  const [grund, setGrund] = useState("");
  const [toast, setToast] = useState<ToastState>(null);

  const load = useCallback(() => {
    flowcheckApi
      .freigaben()
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

  const approve = (f: Freigabe) => {
    setActingId(f.request_id);
    flowcheckApi
      .approve(f.request_id)
      .then((res) => {
        // Mehrstufig: status "offen" (final !== true) → an nächste Rolle gerückt,
        // in der Liste behalten und die Zielrolle aktualisieren.
        if (res.status === "offen" && res.final !== true) {
          setItems((prev) =>
            prev.map((x) =>
              x.request_id === f.request_id
                ? { ...x, stufe: res.next_role || x.stufe, required_role: res.next_role || x.required_role }
                : x
            )
          );
          setToast({ type: "success", text: `Stufe freigegeben — weiter an ${res.next_role || "nächste Stufe"}` });
        } else {
          setItems((prev) => prev.filter((x) => x.request_id !== f.request_id));
          setToast({ type: "success", text: `Freigabe für ${f.lieferant} genehmigt` });
        }
        notifyDataChanged(); // Sidebar-Badge live aktualisieren
      })
      .catch((e) => setToast({ type: "error", text: e instanceof ApiError ? e.message : "Aktion fehlgeschlagen" }))
      .finally(() => setActingId(null));
  };

  const confirmReject = () => {
    if (!rejectFor) return;
    const f = rejectFor;
    setActingId(f.request_id);
    flowcheckApi
      .reject(f.request_id, grund.trim() || undefined)
      .then(() => {
        setItems((prev) => prev.filter((x) => x.request_id !== f.request_id));
        setToast({ type: "success", text: `Freigabe für ${f.lieferant} abgelehnt` });
        setRejectFor(null);
        setGrund("");
        notifyDataChanged(); // Sidebar-Badge live aktualisieren
      })
      .catch((e) => setToast({ type: "error", text: e instanceof ApiError ? e.message : "Aktion fehlgeschlagen" }))
      .finally(() => setActingId(null));
  };

  return (
    <div className="fc-fade-in">
      {toast && <Toast type={toast.type} text={toast.text} onClose={() => setToast(null)} />}

      <PageHeader title="Freigaben" description="Ausstehende Rechnungsfreigaben" />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="h-6 w-6" />}
          title="Keine ausstehenden Freigaben"
          description="Alle Rechnungen wurden bearbeitet. Laden Sie neue Rechnungen hoch."
          action={
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95"
            >
              Rechnung hochladen →
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((f) => (
            <FreigabeCard
              key={f.request_id}
              f={f}
              busy={actingId === f.request_id}
              onApprove={() => approve(f)}
              onReject={() => setRejectFor(f)}
            />
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRejectFor(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-[#1a1a2e]">Freigabe ablehnen</h2>
            <p className="mt-1 text-sm text-[#64748b]">
              {rejectFor.lieferant} · {eur(rejectFor.betrag)}
            </p>
            <label className="mt-4 block text-xs font-medium uppercase tracking-wider text-[#64748b]">
              Grund der Ablehnung
            </label>
            <textarea
              value={grund}
              onChange={(e) => setGrund(e.target.value)}
              rows={3}
              autoFocus
              placeholder="z. B. Betrag weicht von Bestellung ab"
              className="mt-1.5 w-full rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setRejectFor(null)}
                className="rounded-xl px-5 py-2.5 font-medium text-[#003856] transition-all hover:bg-[#003856]/5 active:scale-95"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmReject}
                disabled={actingId === rejectFor.request_id}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
              >
                {actingId === rejectFor.request_id && <Loader2 className="h-4 w-4 animate-spin" />}
                Ablehnen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
