"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { flowcheckApi, ApiError, type UploadResult } from "@/lib/api-client";
import PageHeader from "@/components/PageHeader";
import { Spinner } from "@/components/States";

interface Row {
  file: File;
  state: "queued" | "uploading" | "done" | "error";
  detail?: string;
}

function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const ACCEPT = ".pdf,.xml,.png,.jpg,.jpeg";

export default function UploadPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    setRows((prev) => [...prev, ...list.map((file) => ({ file, state: "queued" as const }))]);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer?.files) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const removeRow = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));

  const uploadAll = async () => {
    const pending = rows.filter((r) => r.state === "queued" || r.state === "error");
    if (pending.length === 0) return;
    setBusy(true);
    setError(null);
    setRows((prev) => prev.map((r) => (r.state === "queued" || r.state === "error" ? { ...r, state: "uploading" } : r)));
    try {
      const results = await flowcheckApi.upload(pending.map((r) => r.file));
      const byName = new Map<string, UploadResult>();
      (results || []).forEach((res) => byName.set(res.filename, res));
      setRows((prev) =>
        prev.map((r) => {
          if (r.state !== "uploading") return r;
          const res = byName.get(r.file.name);
          if (res && res.status !== "ok" && res.status !== undefined) {
            return { ...r, state: "error", detail: res.detail || "Verarbeitung fehlgeschlagen" };
          }
          return { ...r, state: "done", detail: res?.detail };
        })
      );
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Upload fehlgeschlagen";
      setError(msg);
      setRows((prev) => prev.map((r) => (r.state === "uploading" ? { ...r, state: "error", detail: msg } : r)));
    } finally {
      setBusy(false);
    }
  };

  const queuedCount = rows.filter((r) => r.state === "queued" || r.state === "error").length;
  const doneCount = rows.filter((r) => r.state === "done").length;

  return (
    <div className="fc-fade-in">
      <PageHeader
        title="Rechnungen hochladen"
        description="PDF, XRechnung (XML) oder Foto — mehrere Dateien gleichzeitig möglich."
        action={
          doneCount > 0 ? (
            <Link
              href="/rechnungen"
              className="rounded-xl bg-[#003856] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#002a42]"
            >
              Zu den Rechnungen →
            </Link>
          ) : undefined
        }
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition ${
          dragging ? "border-[#003856] bg-[#003856]/5" : "border-stone-300 bg-white hover:border-[#003856]/40"
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
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#003856]/10 text-2xl">
          📤
        </div>
        <p className="text-base font-medium text-stone-800">Dateien hierher ziehen</p>
        <p className="mt-1 text-sm text-stone-500">oder klicken zum Auswählen · PDF, XML, JPG, PNG</p>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
          {error}
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-6 rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/60">
          <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3">
            <p className="text-sm font-semibold text-stone-800">
              {rows.length} {rows.length === 1 ? "Datei" : "Dateien"}
              {doneCount > 0 && <span className="ml-2 text-emerald-600">· {doneCount} verarbeitet</span>}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRows([])}
                disabled={busy}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100 disabled:opacity-50"
              >
                Leeren
              </button>
              <button
                onClick={uploadAll}
                disabled={busy || queuedCount === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-[#003856] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#002a42] disabled:opacity-50"
              >
                {busy && <Spinner className="h-4 w-4 text-white" />}
                {busy ? "Lädt hoch …" : `${queuedCount} hochladen`}
              </button>
            </div>
          </div>
          <ul className="divide-y divide-stone-100">
            {rows.map((r, i) => (
              <li key={`${r.file.name}-${i}`} className="flex items-center gap-3 px-5 py-3">
                <span className="text-lg">{r.file.type.includes("pdf") ? "📕" : r.file.name.endsWith(".xml") ? "🧾" : "🖼️"}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-800">{r.file.name}</p>
                  <p className="text-xs text-stone-400">
                    {fileSize(r.file.size)}
                    {r.detail && <span className="ml-2 text-rose-500">{r.detail}</span>}
                  </p>
                </div>
                <div className="shrink-0">
                  {r.state === "queued" && <span className="text-xs text-stone-400">Bereit</span>}
                  {r.state === "uploading" && <Spinner className="h-4 w-4" />}
                  {r.state === "done" && <span className="text-xs font-semibold text-emerald-600">✓ Fertig</span>}
                  {r.state === "error" && <span className="text-xs font-semibold text-rose-600">Fehler</span>}
                </div>
                {(r.state === "queued" || r.state === "error") && !busy && (
                  <button
                    onClick={() => removeRow(i)}
                    className="text-stone-300 transition hover:text-rose-500"
                    aria-label="Entfernen"
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
