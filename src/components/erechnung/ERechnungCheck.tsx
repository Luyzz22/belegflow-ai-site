"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MinusCircle,
  Loader2,
  Download,
  RotateCcw,
  ArrowRight,
} from "lucide-react";

type LevelValue = "ok" | "error" | "warning" | "skipped" | string;

interface Party {
  name?: string | null;
  vatId?: string | null;
  address?: string | null;
}
interface LineItem {
  name?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  net?: number | null;
  vatRate?: number | null;
}
interface ValidationResult {
  level: { syntax: LevelValue; schema: LevelValue; schematron: LevelValue };
  summary: { valid: boolean; errors: number; warnings: number; format?: string | null; profile?: string | null; engine?: string | null };
  messages: { level: "error" | "warning" | "info" | string; rule?: string | null; field?: string | null; text: string }[];
  readable?: {
    invoiceNumber?: string | null;
    issueDate?: string | null;
    dueDate?: string | null;
    seller?: Party | null;
    buyer?: Party | null;
    lineItems?: LineItem[] | null;
    totals?: { net?: number | null; vat?: number | null; gross?: number | null; currency?: string | null } | null;
  } | null;
}

const MAX_BYTES = 10 * 1024 * 1024;
const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";

function money(value: number | null | undefined, currency = "EUR"): string {
  if (value == null || !Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: currency || "EUR" }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency || ""}`.trim();
  }
}

function friendlyError(status: number): string {
  switch (status) {
    case 400:
    case 422:
      return "Die Datei konnte nicht gelesen werden. Bitte laden Sie eine gültige XRechnung-XML oder ZUGFeRD-/Factur-X-PDF hoch.";
    case 413:
      return "Die Datei ist zu groß. Bitte maximal 10 MB.";
    case 429:
      return "Zu viele Prüfungen in kurzer Zeit. Bitte warten Sie einen Moment und versuchen Sie es erneut.";
    case 504:
      return "Die Prüfung hat zu lange gedauert (Zeitüberschreitung). Bitte versuchen Sie es erneut.";
    default:
      return "Die Prüfung ist fehlgeschlagen. Bitte versuchen Sie es später erneut.";
  }
}

function levelMeta(v: LevelValue) {
  switch (v) {
    case "ok":
      return { icon: CheckCircle2, cls: "border-emerald-200 bg-emerald-50 text-emerald-700", label: "Bestanden" };
    case "warning":
      return { icon: AlertTriangle, cls: "border-amber-200 bg-amber-50 text-amber-700", label: "Warnungen" };
    case "error":
      return { icon: XCircle, cls: "border-red-200 bg-red-50 text-red-700", label: "Fehler" };
    case "skipped":
      return { icon: MinusCircle, cls: "border-stone-200 bg-stone-50 text-stone-500", label: "Übersprungen" };
    default:
      return { icon: MinusCircle, cls: "border-stone-200 bg-stone-50 text-stone-500", label: "—" };
  }
}

const LEVELS: { key: keyof ValidationResult["level"]; title: string }[] = [
  { key: "syntax", title: "XML-Syntax" },
  { key: "schema", title: "Schema (UBL/CII)" },
  { key: "schematron", title: "EN-16931-Geschäftsregeln" },
];

function buildReportHtml(r: ValidationResult): string {
  const esc = (s: unknown) =>
    String(s ?? "—").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const cur = r.readable?.totals?.currency || "EUR";
  const badge = (v: LevelValue) => {
    const m = levelMeta(v);
    return `<span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:12px;background:#f1f5f9">${m.label}</span>`;
  };
  const rows = (r.messages || [])
    .map(
      (m) =>
        `<tr><td style="padding:4px 8px;border-bottom:1px solid #eee">${esc(m.level)}</td><td style="padding:4px 8px;border-bottom:1px solid #eee">${esc(m.rule)}</td><td style="padding:4px 8px;border-bottom:1px solid #eee">${esc(m.field)}</td><td style="padding:4px 8px;border-bottom:1px solid #eee">${esc(m.text)}</td></tr>`
    )
    .join("");
  const li = (r.readable?.lineItems || [])
    .map(
      (it) =>
        `<tr><td style="padding:4px 8px;border-bottom:1px solid #eee">${esc(it.name)}</td><td style="padding:4px 8px;border-bottom:1px solid #eee">${esc(it.quantity)}</td><td style="padding:4px 8px;border-bottom:1px solid #eee">${money(it.net ?? null, cur)}</td><td style="padding:4px 8px;border-bottom:1px solid #eee">${esc(it.vatRate)}%</td></tr>`
    )
    .join("");
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>E-Rechnung Prüfbericht</title></head>
  <body style="font-family:Inter,Arial,sans-serif;color:#1a1a2e;max-width:800px;margin:24px auto;padding:0 16px">
    <h1 style="color:#003856">E-Rechnung — Prüfbericht</h1>
    <p style="color:#64748b;font-size:13px">Generiert am ${esc(new Date().toLocaleString("de-DE"))} · FlowCheck AI+ / SBS Deutschland GmbH &amp; Co. KG</p>
    <h2 style="color:#003856;font-size:16px">Prüfebenen</h2>
    <p>XML-Syntax: ${badge(r.level?.syntax)} &nbsp; Schema: ${badge(r.level?.schema)} &nbsp; EN-16931: ${badge(r.level?.schematron)}</p>
    <p>Format: ${esc(r.summary?.format)} · Profil: ${esc(r.summary?.profile)} · Fehler: ${esc(r.summary?.errors)} · Warnungen: ${esc(r.summary?.warnings)}</p>
    <h2 style="color:#003856;font-size:16px">Meldungen</h2>
    <table style="border-collapse:collapse;width:100%;font-size:13px"><thead><tr><th style="text-align:left;padding:4px 8px">Ebene</th><th style="text-align:left;padding:4px 8px">Regel</th><th style="text-align:left;padding:4px 8px">Feld</th><th style="text-align:left;padding:4px 8px">Hinweis</th></tr></thead><tbody>${rows || '<tr><td colspan="4" style="padding:8px">Keine Meldungen.</td></tr>'}</tbody></table>
    <h2 style="color:#003856;font-size:16px">Rechnung (Lesesicht)</h2>
    <p><strong>Rechnungsnummer:</strong> ${esc(r.readable?.invoiceNumber)} · <strong>Datum:</strong> ${esc(r.readable?.issueDate)} · <strong>Fällig:</strong> ${esc(r.readable?.dueDate)}</p>
    <p><strong>Verkäufer:</strong> ${esc(r.readable?.seller?.name)} (${esc(r.readable?.seller?.vatId)})<br><strong>Käufer:</strong> ${esc(r.readable?.buyer?.name)} (${esc(r.readable?.buyer?.vatId)})</p>
    <table style="border-collapse:collapse;width:100%;font-size:13px"><thead><tr><th style="text-align:left;padding:4px 8px">Position</th><th style="text-align:left;padding:4px 8px">Menge</th><th style="text-align:left;padding:4px 8px">Netto</th><th style="text-align:left;padding:4px 8px">USt</th></tr></thead><tbody>${li || '<tr><td colspan="4" style="padding:8px">Keine Positionen.</td></tr>'}</tbody></table>
    <p style="margin-top:12px"><strong>Netto:</strong> ${money(r.readable?.totals?.net ?? null, cur)} · <strong>USt:</strong> ${money(r.readable?.totals?.vat ?? null, cur)} · <strong>Brutto:</strong> ${money(r.readable?.totals?.gross ?? null, cur)}</p>
    <p style="color:#94a3b8;font-size:11px;margin-top:24px">Technische Entscheidungshilfe. Annahme/Korrektur/Buchung bleibt Ihre fachliche Entscheidung.</p>
  </body></html>`;
}

export default function ERechnungCheck() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((file: File) => {
    if (file.size > MAX_BYTES) {
      setStatus("error");
      setError("Die Datei ist zu groß. Bitte maximal 10 MB.");
      return;
    }
    setFileName(file.name);
    setStatus("loading");
    setError("");
    setResult(null);

    const fd = new FormData();
    fd.append("file", file);

    fetch("/api/public/validate", { method: "POST", body: fd })
      .then(async (res) => {
        if (!res.ok) {
          setStatus("error");
          setError(friendlyError(res.status));
          return;
        }
        const data = (await res.json()) as ValidationResult;
        setResult(data);
        setStatus("done");
      })
      .catch(() => {
        setStatus("error");
        setError("Verbindung fehlgeschlagen. Bitte versuchen Sie es erneut.");
      });
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) validate(f);
  };

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setError("");
    setFileName("");
  };

  const downloadPdf = () => {
    if (!result) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(buildReportHtml(result));
    w.document.close();
    w.focus();
    w.setTimeout(() => w.print(), 300);
  };

  return (
    <div>
      {/* Dropzone */}
      {status !== "done" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
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
          aria-label="Datei zum Prüfen auswählen"
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
            dragging
              ? "border-[#003856] bg-[#003856]/5"
              : "border-[rgba(0,56,86,0.2)] bg-white hover:border-[#003856]/40 hover:bg-[#faf9f7]"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xml,.pdf,application/xml,text/xml,application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) validate(f);
              e.target.value = "";
            }}
          />
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#003856]/10 text-[#003856]">
            {status === "loading" ? <Loader2 className="h-8 w-8 animate-spin" /> : <UploadCloud className="h-8 w-8" />}
          </div>
          {status === "loading" ? (
            <p className="text-base font-semibold text-[#1a1a2e]">„{fileName}“ wird geprüft …</p>
          ) : (
            <>
              <p className="text-base font-semibold text-[#1a1a2e]">XML oder ZUGFeRD-PDF ablegen</p>
              <p className="mt-1.5 text-sm text-[#64748b]">bis 10 MB · ohne Anmeldung</p>
            </>
          )}
        </div>
      )}

      {/* Disclaimer */}
      {status !== "done" && (
        <p className="mt-3 text-xs text-[#94a3b8]">
          Technische Entscheidungshilfe. Annahme/Korrektur/Buchung bleibt Ihre fachliche Entscheidung.
        </p>
      )}

      {/* Fehlerzustand */}
      {status === "error" && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button onClick={reset} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50">
              <RotateCcw className="h-4 w-4" /> Erneut versuchen
            </button>
          </div>
        </div>
      )}

      {/* Ergebnis */}
      {status === "done" && result && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-[#1a1a2e]">
              <FileCheck2 className="h-5 w-5 text-[#003856]" /> Prüfergebnis
              {fileName && <span className="text-sm font-normal text-[#94a3b8]">· {fileName}</span>}
            </h2>
            <div className="flex gap-2">
              <button onClick={downloadPdf} className="inline-flex items-center gap-2 rounded-xl bg-[#003856] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#002a42] active:scale-95">
                <Download className="h-4 w-4" /> Prüfbericht als PDF
              </button>
              <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2 text-sm font-medium text-[#003856] transition hover:bg-[#faf9f7] active:scale-95">
                <RotateCcw className="h-4 w-4" /> Neue Prüfung
              </button>
            </div>
          </div>

          {/* 3 Prüfebenen */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {LEVELS.map(({ key, title }) => {
              const m = levelMeta(result.level?.[key]);
              const Icon = m.icon;
              return (
                <div key={key} className={`flex items-center gap-3 rounded-2xl border p-4 ${m.cls}`}>
                  <Icon className="h-6 w-6 shrink-0" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider opacity-80">{title}</p>
                    <p className="text-sm font-semibold">{m.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {result.summary?.engine === "kosit-python" && (
            <p className="text-xs text-[#94a3b8]">
              Basis-Prüfung (EN-16931-Pflichtfelder) — die vollständige Schematron-Validierung ist derzeit nicht aktiv.
            </p>
          )}

          {/* Summary */}
          <div className={CARD}>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <span><span className="text-[#64748b]">Format:</span> <span className="font-medium text-[#1a1a2e]">{result.summary?.format || "—"}</span></span>
              <span><span className="text-[#64748b]">Profil:</span> <span className="font-medium text-[#1a1a2e]">{result.summary?.profile || "—"}</span></span>
              <span><span className="text-[#64748b]">Fehler:</span> <span className="font-medium text-red-600">{result.summary?.errors ?? 0}</span></span>
              <span><span className="text-[#64748b]">Warnungen:</span> <span className="font-medium text-amber-600">{result.summary?.warnings ?? 0}</span></span>
            </div>
          </div>

          {/* Meldungen */}
          {result.messages && result.messages.length > 0 && (
            <div className={`${CARD} overflow-x-auto`}>
              <h3 className="mb-3 text-base font-semibold text-[#1a1a2e]">Meldungen</h3>
              <ul className="space-y-2.5">
                {result.messages.map((m, i) => {
                  const meta = levelMeta(m.level === "info" ? "skipped" : m.level);
                  const Icon = meta.icon;
                  return (
                    <li key={i} className="flex items-start gap-3 rounded-xl border border-[rgba(0,56,86,0.08)] p-3">
                      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${m.level === "error" ? "text-red-600" : m.level === "warning" ? "text-amber-600" : "text-stone-400"}`} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-1.5">
                          {typeof m.rule === "string" && m.rule && <span className="rounded bg-[#003856]/5 px-1.5 py-0.5 font-mono text-xs font-semibold text-[#003856]">{m.rule}</span>}
                          {typeof m.field === "string" && m.field && <span className="rounded bg-[#c8985a]/10 px-1.5 py-0.5 font-mono text-xs font-semibold text-[#b07f42]">{m.field}</span>}
                        </div>
                        {/* Laufzeit-Guard: Backend-Text nie ungeprüft als React-Child (React #31). */}
                        <p className="mt-1 text-sm text-[#1a1a2e]">{typeof m.text === "string" ? m.text : "—"}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Klartext-Ansicht */}
          {result.readable && (
            <div className={CARD}>
              <h3 className="mb-4 text-base font-semibold text-[#1a1a2e]">Rechnung im Klartext</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Info label="Rechnungsnummer" value={result.readable.invoiceNumber} />
                <Info label="Rechnungsdatum" value={result.readable.issueDate} />
                <Info label="Fällig am" value={result.readable.dueDate} />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <PartyCard title="Verkäufer" party={result.readable.seller} />
                <PartyCard title="Käufer" party={result.readable.buyer} />
              </div>

              {result.readable.lineItems && result.readable.lineItems.length > 0 && (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[rgba(0,56,86,0.06)] text-left text-xs font-medium uppercase tracking-wider text-[#64748b]">
                        <th className="px-3 py-2.5">Position</th>
                        <th className="px-3 py-2.5">Menge</th>
                        <th className="px-3 py-2.5">Einzelpreis</th>
                        <th className="px-3 py-2.5">Netto</th>
                        <th className="px-3 py-2.5">USt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(0,56,86,0.06)]">
                      {result.readable.lineItems.map((it, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2.5 font-medium text-[#1a1a2e]">{it.name || "—"}</td>
                          <td className="px-3 py-2.5 text-[#64748b]">{it.quantity ?? "—"}</td>
                          <td className="px-3 py-2.5 text-[#64748b]">{money(it.unitPrice, result.readable?.totals?.currency || "EUR")}</td>
                          <td className="px-3 py-2.5 text-[#64748b]">{money(it.net, result.readable?.totals?.currency || "EUR")}</td>
                          <td className="px-3 py-2.5 text-[#64748b]">{it.vatRate != null ? `${it.vatRate}%` : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-5 flex flex-wrap justify-end gap-x-8 gap-y-1 text-sm">
                <span><span className="text-[#64748b]">Netto:</span> <span className="font-medium text-[#1a1a2e]">{money(result.readable.totals?.net, result.readable.totals?.currency || "EUR")}</span></span>
                <span><span className="text-[#64748b]">USt:</span> <span className="font-medium text-[#1a1a2e]">{money(result.readable.totals?.vat, result.readable.totals?.currency || "EUR")}</span></span>
                <span><span className="text-[#64748b]">Brutto:</span> <span className="font-bold text-[#003856]">{money(result.readable.totals?.gross, result.readable.totals?.currency || "EUR")}</span></span>
              </div>
            </div>
          )}

          {/* Conversion-CTA */}
          <div className="rounded-2xl bg-[#003856] p-6 text-white sm:p-8">
            <h3 className="text-lg font-semibold">Das automatisch für jede Eingangsrechnung?</h3>
            <p className="mt-2 max-w-2xl text-sm text-white/75">
              Inklusive KI-Kontierung (SKR03/04), Freigabe-Workflow und DATEV-Export — ganz ohne manuelles Prüfen.
            </p>
            <Link
              href="/register"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#FFB900] px-6 py-3 text-sm font-bold text-[#003856] transition-all hover:bg-[#e6a800] active:scale-95"
            >
              BelegFlow kostenlos testen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="text-xs text-[#94a3b8]">
            Technische Entscheidungshilfe. Annahme/Korrektur/Buchung bleibt Ihre fachliche Entscheidung. Hochgeladene
            Dateien werden nur temporär verarbeitet und nicht gespeichert.
          </p>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl bg-[#faf9f7] p-3">
      <p className="text-xs font-medium uppercase tracking-wider text-[#64748b]">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-[#1a1a2e]">{value || "—"}</p>
    </div>
  );
}

function PartyCard({ title, party }: { title: string; party?: Party | null }) {
  return (
    <div className="rounded-xl border border-[rgba(0,56,86,0.08)] p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-[#64748b]">{title}</p>
      <p className="mt-1 text-sm font-semibold text-[#1a1a2e]">{party?.name || "—"}</p>
      {party?.vatId && <p className="text-xs text-[#64748b]">USt-IdNr.: {party.vatId}</p>}
      {party?.address && <p className="text-xs text-[#64748b]">{party.address}</p>}
    </div>
  );
}
