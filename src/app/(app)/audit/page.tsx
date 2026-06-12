"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Download,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Search,
  CloudUpload,
  Sparkles,
  ShieldCheck,
  XCircle,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { flowcheckApi, ApiError, type AuditEntry } from "@/lib/api-client";
import PageHeader from "@/components/PageHeader";
import { ErrorState, EmptyState, Skeleton } from "@/components/States";

const LIMIT = 50;

type Enriched = AuditEntry & { rel: string };

const PERIODS: { value: string; label: string }[] = [
  { value: "", label: "Alle" },
  { value: "today", label: "Heute" },
  { value: "7", label: "7 Tage" },
  { value: "30", label: "30 Tage" },
  { value: "custom", label: "Benutzerdefiniert" },
];

const TYPES: { value: string; label: string }[] = [
  { value: "", label: "Alle Aktionen" },
  { value: "upload", label: "Upload" },
  { value: "freigabe", label: "Freigabe" },
  { value: "export", label: "Export" },
];

function actionMeta(aktion: string): { icon: LucideIcon; cls: string; ring: string } {
  const a = (aktion || "").toLowerCase();
  if (a.includes("upload") || a.includes("hochgel")) return { icon: CloudUpload, cls: "text-blue-600", ring: "bg-blue-50" };
  if (a.includes("verarbei")) return { icon: Sparkles, cls: "text-emerald-600", ring: "bg-emerald-50" };
  if (a.includes("freigeg") || a.includes("freigabe") || a.includes("genehm"))
    return { icon: ShieldCheck, cls: "text-emerald-600", ring: "bg-emerald-50" };
  if (a.includes("abgelehnt") || a.includes("ablehn") || a.includes("reject"))
    return { icon: XCircle, cls: "text-red-600", ring: "bg-red-50" };
  if (a.includes("export")) return { icon: Download, cls: "text-slate-500", ring: "bg-slate-100" };
  return { icon: Activity, cls: "text-[#003856]", ring: "bg-[#003856]/5" };
}

function relativeTime(iso: string, now: number): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return iso || "";
  const diffMin = Math.floor(Math.max(0, now - t) / 60_000);
  if (diffMin < 1) return "gerade eben";
  if (diffMin < 60) return `vor ${diffMin} Min`;
  const diffStd = Math.floor(diffMin / 60);
  if (diffStd < 24) return `vor ${diffStd} Std`;
  const diffTage = Math.floor(diffStd / 24);
  if (diffTage === 1) return "gestern";
  if (diffTage < 7) return `vor ${diffTage} Tagen`;
  return new Date(t).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function AuditPage() {
  const [items, setItems] = useState<Enriched[]>([]);
  const [total, setTotal] = useState(0);
  const [period, setPeriod] = useState("");
  const [von, setVon] = useState("");
  const [bis, setBis] = useState("");
  const [typ, setTyp] = useState("");
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (von) params.set("von", von);
    if (bis) params.set("bis", bis);
    if (typ) params.set("aktion", typ);
    params.set("limit", String(LIMIT));
    params.set("offset", String(offset));
    flowcheckApi
      .audit(params.toString())
      .then((d) => {
        const now = Date.now();
        setItems((d.items || []).map((a) => ({ ...a, rel: relativeTime(a.zeitpunkt, now) })));
        setTotal(d.total || 0);
        setError(null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Daten konnten nicht geladen werden."))
      .finally(() => setLoading(false));
  }, [von, bis, typ, offset]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    void load();
  }, [load]);

  useEffect(() => {
    void load();
  }, [load]);

  const choosePeriod = (p: string) => {
    setPeriod(p);
    setOffset(0);
    const now = new Date();
    if (p === "today") {
      setVon(isoDay(now));
      setBis("");
    } else if (p === "7" || p === "30") {
      const d = new Date();
      d.setDate(d.getDate() - Number(p));
      setVon(isoDay(d));
      setBis("");
    } else if (p === "") {
      setVon("");
      setBis("");
    }
    // "custom" → von/bis bleiben der manuellen Eingabe überlassen
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((a) =>
      `${a.benutzer} ${a.aktion} ${a.details}`.toLowerCase().includes(q)
    );
  }, [items, query]);

  const page = Math.floor(offset / LIMIT) + 1;
  const pages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="fc-fade-in">
      <PageHeader
        title="Audit-Trail"
        description="Revisionssichere Protokollierung aller Aktionen"
        action={
          <a
            href={flowcheckApi.auditCsvUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium text-[#003856] transition-all hover:bg-[#003856]/5 active:scale-95"
          >
            <Download className="h-4 w-4" />
            CSV exportieren
          </a>
        }
      />

      {/* Filter */}
      <div className="mb-6 space-y-4 rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-5 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Benutzer, Aktion, Details durchsuchen …"
              className="w-full rounded-xl border border-[rgba(0,56,86,0.12)] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
            />
          </div>
          <select
            value={typ}
            onChange={(e) => {
              setTyp(e.target.value);
              setOffset(0);
            }}
            className="rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => choosePeriod(p.value)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition active:scale-95 ${
                period === p.value
                  ? "bg-[#003856] text-white"
                  : "bg-[#faf9f7] text-[#64748b] hover:bg-[#003856]/5 hover:text-[#003856]"
              }`}
            >
              {p.label}
            </button>
          ))}
          {period === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={von}
                onChange={(e) => {
                  setVon(e.target.value);
                  setOffset(0);
                }}
                className="rounded-xl border border-[rgba(0,56,86,0.12)] px-3 py-1.5 text-sm outline-none focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
              />
              <span className="text-sm text-[#64748b]">bis</span>
              <input
                type="date"
                value={bis}
                onChange={(e) => {
                  setBis(e.target.value);
                  setOffset(0);
                }}
                className="rounded-xl border border-[rgba(0,56,86,0.12)] px-3 py-1.5 text-sm outline-none focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
              />
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="h-6 w-6" />}
          title="Noch keine Ereignisse."
          description="Für die gewählten Filter gibt es keine Protokolleinträge."
        />
      ) : (
        <div className="relative pl-4">
          {/* vertikale Linie */}
          <div className="absolute bottom-2 left-[26px] top-2 w-px bg-[rgba(0,56,86,0.1)]" aria-hidden />
          <ul className="space-y-3">
            {filtered.map((a) => {
              const meta = actionMeta(a.aktion);
              const Icon = meta.icon;
              return (
                <li key={a.id} className="relative flex items-start gap-4">
                  <span
                    className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.ring} ${meta.cls} ring-4 ring-[#f8f6f3]`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex-1 rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white px-4 py-3 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#1a1a2e]">{a.aktion}</p>
                      <span className="text-xs text-[#94a3b8]" title={a.zeitpunkt}>
                        {a.rel}
                      </span>
                    </div>
                    {a.details && <p className="mt-0.5 text-sm text-[#64748b]">{a.details}</p>}
                    <p className="mt-1 text-xs text-[#94a3b8]">{a.benutzer}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {!loading && !error && total > LIMIT && (
        <div className="mt-5 flex items-center justify-between text-sm text-[#64748b]">
          <span>
            Seite {page} von {pages} · {total} Einträge
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - LIMIT))}
              disabled={offset === 0}
              className="inline-flex items-center gap-1 rounded-xl border border-[rgba(0,56,86,0.12)] bg-white px-3 py-2 font-medium text-[#003856] transition hover:bg-[#faf9f7] active:scale-95 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Zurück
            </button>
            <button
              onClick={() => setOffset(offset + LIMIT)}
              disabled={offset + LIMIT >= total}
              className="inline-flex items-center gap-1 rounded-xl border border-[rgba(0,56,86,0.12)] bg-white px-3 py-2 font-medium text-[#003856] transition hover:bg-[#faf9f7] active:scale-95 disabled:opacity-40"
            >
              Weiter
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
