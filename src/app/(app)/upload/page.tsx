"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CloudUpload,
  FileText,
  ScanText,
  Sparkles,
  ShieldCheck,
  Calculator,
  Check,
  Loader2,
  AlertCircle,
  RotateCcw,
  X,
  type LucideIcon,
} from "lucide-react";
import { flowcheckApi, ApiError, toMessage } from "@/lib/api-client";
import { notifyDataChanged } from "@/lib/events";
import { isLimitReached, incrementUsage } from "@/lib/usage";
import PageHeader from "@/components/PageHeader";
import UploadCelebration from "@/components/UploadCelebration";
import { useToast } from "@/components/toast/ToastProvider";

type Status = "running" | "done" | "error";

interface Row {
  id: string;
  file: File;
  stepIndex: number; // Anzahl abgeschlossener Schritte (0–5)
  status: Status;
  errorStep?: number;
  detail?: string;
}

const STEPS: { label: string; icon: LucideIcon }[] = [
  { label: "Dokument empfangen", icon: FileText },
  { label: "Text wird extrahiert", icon: ScanText },
  { label: "KI analysiert Felder", icon: Sparkles },
  { label: "Pflichtangaben geprüft", icon: ShieldCheck },
  { label: "Kontierung vorgeschlagen", icon: Calculator },
];

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.xml";
const MAX_FILES = 20;

function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function UploadPage() {
  const { addToast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [celebrate, setCelebrate] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>[]>>({});

  // Zeigt nach dem allerersten erfolgreichen Upload ein Erfolgs-Modal.
  const maybeCelebrate = useCallback((name: string) => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("fc_first_upload")) return;
    localStorage.setItem("fc_first_upload", "true");
    setCelebrate(name);
  }, []);

  const clearTimers = useCallback((id?: string) => {
    if (id) {
      (timers.current[id] || []).forEach(clearTimeout);
      delete timers.current[id];
    } else {
      Object.values(timers.current).forEach((list) => list.forEach(clearTimeout));
      timers.current = {};
    }
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const patch = (id: string, fn: (r: Row) => Row) =>
    setRows((prev) => prev.map((r) => (r.id === id ? fn(r) : r)));

  const push = (id: string, t: ReturnType<typeof setTimeout>) => {
    (timers.current[id] = timers.current[id] || []).push(t);
  };

  const runPipeline = useCallback((row: Row) => {
    const { id, file } = row;

    // Schritte 1→3 vorab durchlaufen, bei Schritt 3 ("KI analysiert") warten.
    const advance = (target: number, delay: number) => {
      const t = setTimeout(() => {
        patch(id, (r) => (r.status === "running" && r.stepIndex < target ? { ...r, stepIndex: target } : r));
      }, delay);
      push(id, t);
    };
    advance(1, 500);
    advance(2, 1100);
    advance(3, 1700);

    const finish = () => {
      const t1 = setTimeout(() => patch(id, (r) => ({ ...r, stepIndex: 4 })), 200);
      const t2 = setTimeout(() => {
        patch(id, (r) => ({ ...r, stepIndex: 5, status: "done" }));
        incrementUsage();
        maybeCelebrate(file.name);
      }, 400);
      push(id, t1);
      push(id, t2);
    };

    // Fehlertext IMMER durch toMessage() — Backend-Detail kann Objekt/Array sein (React #31).
    const fail = (detail: unknown) => {
      clearTimers(id);
      const msg = detail ? toMessage(detail) : "Verarbeitung fehlgeschlagen";
      patch(id, (r) => ({ ...r, status: "error", errorStep: r.stepIndex, detail: msg }));
    };

    flowcheckApi
      .upload([file])
      .then(([res]) => {
        if (res && res.status !== "ok" && res.status !== undefined) {
          fail(res.detail || "Verarbeitung fehlgeschlagen");
        } else {
          patch(id, (r) => (r.stepIndex < 3 ? { ...r, stepIndex: 3 } : r));
          notifyDataChanged(); // Badges (Review/Export) nach Upload neu laden
          finish();
        }
      })
      .catch((e) => fail(e instanceof ApiError ? e.message : "Upload fehlgeschlagen"));
  }, [clearTimers, maybeCelebrate]);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      if (isLimitReached()) {
        addToast({ type: "error", text: "Monatliches Limit erreicht. Upgraden Sie Ihren Plan." });
        return;
      }
      const list = Array.from(files).slice(0, MAX_FILES);
      if (list.length === 0) return;
      const newRows: Row[] = list.map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        stepIndex: 0,
        status: "running" as const,
      }));
      setRows((prev) => [...prev, ...newRows].slice(0, MAX_FILES));
      newRows.forEach(runPipeline);
    },
    [runPipeline, addToast]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer?.files) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const removeRow = (id: string) => {
    clearTimers(id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const reset = () => {
    clearTimers();
    setRows([]);
  };

  const busy = rows.some((r) => r.status === "running");
  const doneCount = rows.filter((r) => r.status === "done").length;
  const allFinished = rows.length > 0 && rows.every((r) => r.status !== "running");

  return (
    <div className="fc-fade-in">
      <PageHeader title="Upload" description="Rechnungen hochladen und automatisch verarbeiten lassen" />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-14 text-center transition-all ${
          isDragging
            ? "border-[#003856] bg-[#003856]/5"
            : "border-[rgba(0,56,86,0.2)] bg-white hover:border-[#003856]/40 hover:bg-[#faf9f7]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#003856]/10 text-[#003856]">
          <CloudUpload className="h-8 w-8" />
        </div>
        <p className="text-base font-semibold text-[#1a1a2e]">
          Rechnungen hierher ziehen oder klicken zum Auswählen
        </p>
        <p className="mt-1.5 text-sm text-[#64748b]">
          PDF, JPEG, PNG, XML (XRechnung/ZUGFeRD) · Max. 10 MB
        </p>
      </div>

      {/* Vertrauensbildender Datenschutz-Hinweis */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[rgba(0,56,86,0.08)] bg-[#faf9f7] px-4 py-3 text-sm text-[#64748b]">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#003856]" />
        <p>
          Ihre Dokumente werden verschlüsselt übertragen (TLS 1.3) und auf deutschen Servern (Hetzner, Frankfurt)
          gespeichert. Keine Daten werden für KI-Training verwendet.{" "}
          <Link href="/trust" className="font-medium text-[#003856] hover:underline">
            Mehr erfahren →
          </Link>
        </p>
      </div>

      {rows.length > 0 && (
        <div className="mt-6 rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
          <div className="flex items-center justify-between border-b border-[rgba(0,56,86,0.06)] px-6 py-4">
            <h2 className="text-xl font-semibold text-[#1a1a2e]">
              {rows.length} {rows.length === 1 ? "Datei" : "Dateien"}
              {doneCount > 0 && (
                <span className="ml-2 text-sm font-medium text-emerald-600">· {doneCount} verarbeitet</span>
              )}
            </h2>
            <button
              onClick={reset}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium text-[#003856] transition-all hover:bg-[#003856]/5 active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Weitere hochladen
            </button>
          </div>

          <ul className="divide-y divide-[rgba(0,56,86,0.06)]">
            {rows.map((r) => (
              <li key={r.id} className="flex items-start gap-4 px-6 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#faf9f7] text-[#003856]">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-[#1a1a2e]">{r.file.name}</p>
                    <span className="shrink-0 text-xs text-[#64748b]">{fileSize(r.file.size)}</span>
                  </div>

                  {/* Pipeline */}
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {STEPS.map((step, i) => {
                      const Icon = step.icon;
                      const isError = r.status === "error" && r.errorStep === i;
                      const isDone = !isError && (r.status === "done" || i < r.stepIndex);
                      const isActive = !isError && !isDone && r.status === "running" && i === r.stepIndex;
                      return (
                        <li key={i} className="flex items-center gap-2.5">
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                              isError
                                ? "bg-red-100 text-red-600"
                                : isDone
                                  ? "bg-emerald-100 text-emerald-600"
                                  : isActive
                                    ? "bg-[#003856]/10 text-[#003856]"
                                    : "bg-[#faf9f7] text-[#cbd5e1]"
                            }`}
                          >
                            {isError ? (
                              <AlertCircle className="h-3.5 w-3.5" />
                            ) : isDone ? (
                              <Check className="fc-pop h-3.5 w-3.5" />
                            ) : isActive ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Icon className="h-3.5 w-3.5" />
                            )}
                          </span>
                          <span
                            className={`text-xs ${
                              isError
                                ? "font-medium text-red-600"
                                : isDone
                                  ? "text-[#1a1a2e]"
                                  : isActive
                                    ? "font-medium text-[#003856]"
                                    : "text-[#94a3b8]"
                            }`}
                          >
                            {step.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {r.status === "error" && r.detail && (
                    <p className="mt-2 text-xs text-red-600">{r.detail}</p>
                  )}
                </div>

                {r.status !== "running" && (
                  <button
                    onClick={() => removeRow(r.id)}
                    className="shrink-0 rounded-lg p-1 text-[#64748b] transition hover:bg-[#faf9f7] hover:text-red-600 active:scale-95"
                    aria-label="Entfernen"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {allFinished && doneCount > 0 && (
            <div className="flex items-center justify-end gap-3 border-t border-[rgba(0,56,86,0.06)] px-6 py-4">
              <Link
                href="/rechnungen"
                className="inline-flex items-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 font-medium text-white transition-all hover:bg-[#002a42] active:scale-95"
              >
                Zu den Rechnungen →
              </Link>
            </div>
          )}
        </div>
      )}

      {celebrate && <UploadCelebration fileName={celebrate} onClose={() => setCelebrate(null)} />}
    </div>
  );
}
