"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CloudUpload,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileText,
  RotateCcw,
  X,
} from "lucide-react";
import { flowcheckApi, ApiError, type UploadResult } from "@/lib/api-client";
import PageHeader from "@/components/PageHeader";

type RowState = "uploading" | "processing" | "done" | "error";

interface Row {
  id: string;
  file: File;
  state: RowState;
  progress: number;
  detail?: string;
}

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.xml";
const MAX_FILES = 20;

function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const STATE_LABEL: Record<RowState, string> = {
  uploading: "Wird hochgeladen …",
  processing: "Verarbeitung läuft …",
  done: "Fertig",
  error: "Fehler",
};

export default function UploadPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const intervals = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const clearIntervals = useCallback(() => {
    Object.values(intervals.current).forEach((iv) => clearInterval(iv));
    intervals.current = {};
  }, []);

  useEffect(() => () => clearIntervals(), [clearIntervals]);

  const startProgress = useCallback((id: string) => {
    const iv = setInterval(() => {
      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== id || r.state === "done" || r.state === "error") return r;
          const next = Math.min(90, r.progress + Math.random() * 12 + 3);
          const state: RowState = next > 55 ? "processing" : "uploading";
          return { ...r, progress: next, state };
        })
      );
    }, 320);
    intervals.current[id] = iv;
  }, []);

  const runUpload = useCallback(
    async (newRows: Row[]) => {
      setBusy(true);
      setGlobalError(null);
      newRows.forEach((r) => startProgress(r.id));
      try {
        const results = await flowcheckApi.upload(newRows.map((r) => r.file));
        const byName = new Map<string, UploadResult>();
        (results || []).forEach((res) => byName.set(res.filename, res));
        setRows((prev) =>
          prev.map((r) => {
            const target = newRows.find((n) => n.id === r.id);
            if (!target) return r;
            const iv = intervals.current[r.id];
            if (iv) {
              clearInterval(iv);
              delete intervals.current[r.id];
            }
            const res = byName.get(r.file.name);
            if (res && res.status !== "ok" && res.status !== undefined) {
              return {
                ...r,
                state: "error",
                progress: 100,
                detail: res.detail || "Verarbeitung fehlgeschlagen",
              };
            }
            return { ...r, state: "done", progress: 100, detail: res?.detail };
          })
        );
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : "Upload fehlgeschlagen.";
        setGlobalError(msg);
        setRows((prev) =>
          prev.map((r) => {
            const target = newRows.find((n) => n.id === r.id);
            if (!target) return r;
            const iv = intervals.current[r.id];
            if (iv) {
              clearInterval(iv);
              delete intervals.current[r.id];
            }
            return { ...r, state: "error", progress: 100, detail: msg };
          })
        );
      } finally {
        setBusy(false);
      }
    },
    [startProgress]
  );

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files).slice(0, MAX_FILES);
      if (list.length === 0) return;
      const newRows: Row[] = list.map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        state: "uploading" as const,
        progress: 0,
      }));
      setRows((prev) => [...prev, ...newRows].slice(0, MAX_FILES));
      void runUpload(newRows);
    },
    [runUpload]
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
    const iv = intervals.current[id];
    if (iv) {
      clearInterval(iv);
      delete intervals.current[id];
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const reset = () => {
    clearIntervals();
    setRows([]);
    setGlobalError(null);
  };

  const doneCount = rows.filter((r) => r.state === "done").length;
  const allFinished = rows.length > 0 && rows.every((r) => r.state === "done" || r.state === "error");

  return (
    <div className="fc-fade-in">
      <PageHeader
        title="Upload"
        description="Rechnungen hochladen und automatisch verarbeiten lassen"
      />

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

      {globalError && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {globalError}
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-6 rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
          <div className="flex items-center justify-between border-b border-[rgba(0,56,86,0.06)] px-6 py-4">
            <h2 className="text-xl font-semibold text-[#1a1a2e]">
              {rows.length} {rows.length === 1 ? "Datei" : "Dateien"}
              {doneCount > 0 && (
                <span className="ml-2 text-sm font-medium text-emerald-600">
                  · {doneCount} verarbeitet
                </span>
              )}
            </h2>
            <button
              onClick={reset}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium text-[#003856] transition-all hover:bg-[#003856]/5 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Weitere hochladen
            </button>
          </div>

          <ul className="divide-y divide-[rgba(0,56,86,0.06)]">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#faf9f7] text-[#003856]">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-[#1a1a2e]">{r.file.name}</p>
                    <span className="shrink-0 text-xs text-[#64748b]">{fileSize(r.file.size)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[rgba(0,56,86,0.08)]">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          r.state === "error"
                            ? "bg-red-500"
                            : r.state === "done"
                              ? "bg-emerald-500"
                              : "bg-[#003856]"
                        }`}
                        style={{ width: `${r.progress}%` }}
                      />
                    </div>
                    <span
                      className={`flex shrink-0 items-center gap-1.5 text-xs font-medium ${
                        r.state === "error"
                          ? "text-red-600"
                          : r.state === "done"
                            ? "text-emerald-600"
                            : "text-[#64748b]"
                      }`}
                    >
                      {r.state === "done" && <CheckCircle2 className="h-4 w-4" />}
                      {r.state === "error" && <AlertCircle className="h-4 w-4" />}
                      {(r.state === "uploading" || r.state === "processing") && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {r.state === "done" ? "Fertig ✅" : STATE_LABEL[r.state]}
                    </span>
                  </div>
                  {r.state === "error" && r.detail && (
                    <p className="mt-1.5 text-xs text-red-600">{r.detail}</p>
                  )}
                </div>
                {(r.state === "done" || r.state === "error") && (
                  <button
                    onClick={() => removeRow(r.id)}
                    className="shrink-0 rounded-lg p-1 text-[#64748b] transition hover:bg-[#faf9f7] hover:text-red-600"
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
                className="inline-flex items-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 font-medium text-white transition-all hover:bg-[#002a42]"
              >
                Zu den Rechnungen →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
