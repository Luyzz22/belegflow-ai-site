"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Bot,
  ShieldCheck,
  Landmark,
  AlertTriangle,
  CloudUpload,
  XCircle,
  Activity as ActivityIcon,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { flowcheckApi, ApiError, type AuditEntry } from "@/lib/api-client";
import { dateDE } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/States";

const DAY = 86_400_000;

type Cat = "all" | "freigabe" | "ki" | "export" | "anomalie";

const FILTERS: { value: Cat; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "freigabe", label: "Freigaben" },
  { value: "ki", label: "KI-Verarbeitung" },
  { value: "export", label: "Exporte" },
  { value: "anomalie", label: "Anomalien" },
];

function categorize(a: AuditEntry): Cat {
  const t = `${a.aktion} ${a.details}`.toLowerCase();
  if (t.includes("anomal")) return "anomalie";
  if (t.includes("export")) return "export";
  if (t.includes("freig") || t.includes("genehm") || t.includes("abgelehnt")) return "freigabe";
  if (t.includes("verarbei") || t.includes("extrah") || t.includes("ki") || (a.benutzer || "").toLowerCase().includes("ki")) return "ki";
  return "all";
}

function meta(cat: Cat, a: AuditEntry): { icon: LucideIcon; cls: string; ring: string; isBot: boolean; cta: { label: string; href: string } } {
  const lower = (a.aktion || "").toLowerCase();
  if (cat === "anomalie") return { icon: AlertTriangle, cls: "text-amber-600", ring: "bg-amber-50", isBot: false, cta: { label: "Prüfen", href: "/rechnungen" } };
  if (cat === "export") return { icon: Landmark, cls: "text-slate-500", ring: "bg-slate-100", isBot: false, cta: { label: "Export öffnen", href: "/export" } };
  if (cat === "ki") return { icon: Bot, cls: "text-emerald-600", ring: "bg-emerald-50", isBot: true, cta: { label: "Alle ansehen", href: "/rechnungen" } };
  if (cat === "freigabe") {
    const rejected = lower.includes("abgelehnt");
    return {
      icon: rejected ? XCircle : ShieldCheck,
      cls: rejected ? "text-red-600" : "text-emerald-600",
      ring: rejected ? "bg-red-50" : "bg-emerald-50",
      isBot: false,
      cta: { label: "Rechnung ansehen", href: "/rechnungen" },
    };
  }
  return { icon: CloudUpload, cls: "text-blue-600", ring: "bg-blue-50", isBot: false, cta: { label: "Ansehen", href: "/rechnungen" } };
}

function relTime(iso: string, now: number): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const m = Math.floor(Math.max(0, now - t) / 60_000);
  if (m < 1) return "gerade eben";
  if (m < 60) return `vor ${m} Min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `vor ${h} Std`;
  const d = Math.floor(h / 24);
  return d === 1 ? "gestern" : `vor ${d} Tagen`;
}

function bucket(iso: string, now: number): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "Älter";
  const startToday = new Date(now).setHours(0, 0, 0, 0);
  if (t >= startToday) return "Heute";
  if (t >= startToday - DAY) return "Gestern";
  if (t >= now - 7 * DAY) return "Diese Woche";
  return "Älter";
}

const BUCKET_ORDER = ["Heute", "Gestern", "Diese Woche", "Älter"];

export default function AktivitaetPage() {
  const [items, setItems] = useState<AuditEntry[]>([]);
  const [now, setNow] = useState(0);
  const [filter, setFilter] = useState<Cat>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCount, setNewCount] = useState(0);
  const topIdRef = useRef<number | null>(null);

  const apply = useCallback((list: AuditEntry[]) => {
    setItems(list);
    setNow(Date.now());
    const top = list[0]?.id ?? null;
    topIdRef.current = top;
    if (typeof window !== "undefined" && top != null) localStorage.setItem("fc_activity_seen", String(top));
    setNewCount(0);
  }, []);

  const load = useCallback(() => {
    flowcheckApi
      .audit("limit=100&offset=0")
      .then((d) => {
        apply(d.items || []);
        setError(null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Aktivitäten konnten nicht geladen werden."))
      .finally(() => setLoading(false));
  }, [apply]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    void load();
  }, [load]);

  useEffect(() => {
    void load();
  }, [load]);

  // Silent Auto-Refresh alle 10 s — zeigt nur ein Banner bei neuen Events.
  useEffect(() => {
    const iv = setInterval(() => {
      flowcheckApi
        .audit("limit=100&offset=0")
        .then((d) => {
          const list = d.items || [];
          const top = list[0]?.id ?? null;
          if (top != null && topIdRef.current != null && top !== topIdRef.current) {
            const added = list.findIndex((x) => x.id === topIdRef.current);
            setNewCount(added > 0 ? added : list.length);
          }
        })
        .catch(() => {});
    }, 10_000);
    return () => clearInterval(iv);
  }, []);

  const filtered = useMemo(() => (filter === "all" ? items : items.filter((a) => categorize(a) === filter)), [items, filter]);

  const groups = useMemo(() => {
    const map = new Map<string, AuditEntry[]>();
    filtered.forEach((a) => {
      const b = bucket(a.zeitpunkt, now);
      const arr = map.get(b) ?? [];
      arr.push(a);
      map.set(b, arr);
    });
    return BUCKET_ORDER.filter((b) => map.has(b)).map((b) => ({ label: b, items: map.get(b)! }));
  }, [filtered, now]);

  return (
    <div className="fc-fade-in">
      <PageHeader title="Aktivität" description="Live-Feed aller Ereignisse" />

      {newCount > 0 && (
        <button
          onClick={load}
          className="mb-4 w-full rounded-xl border border-[#003856]/20 bg-[#003856]/5 px-4 py-2.5 text-sm font-medium text-[#003856] transition hover:bg-[#003856]/10 active:scale-[0.99]"
        >
          {newCount} neue {newCount === 1 ? "Aktivität" : "Aktivitäten"} — anzeigen
        </button>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition active:scale-95 ${
              filter === f.value ? "bg-[#003856] text-white" : "bg-white text-[#64748b] ring-1 ring-[rgba(0,56,86,0.08)] hover:bg-[#faf9f7] hover:text-[#003856]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState label="Aktivitäten werden geladen …" />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ActivityIcon className="h-6 w-6" />}
          title="Noch keine Aktivitäten"
          description="Laden Sie Ihre erste Rechnung hoch — alle Ereignisse erscheinen dann hier."
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
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.label}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">{g.label}</p>
              <div className="space-y-2">
                {g.items.map((a) => {
                  const cat = categorize(a);
                  const m = meta(cat, a);
                  const Icon = m.icon;
                  const initials = (a.benutzer || "?").slice(0, 1).toUpperCase();
                  return (
                    <div key={a.id} className="flex items-start gap-3 rounded-xl bg-white p-4 ring-1 ring-[rgba(0,56,86,0.06)] transition hover:bg-[#faf9f7]">
                      {m.isBot ? (
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.ring} ${m.cls}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                      ) : (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#003856] text-xs font-semibold text-white">
                          {initials}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#1a1a2e]">
                          <span className="font-semibold">{a.benutzer || "System"}</span> · {a.aktion_label || a.aktion}
                        </p>
                        {a.details && <p className="text-sm text-[#64748b]">{a.details}</p>}
                        <p className="mt-0.5 text-xs text-[#94a3b8]">{dateDE(a.zeitpunkt, true)} · {relTime(a.zeitpunkt, now)}</p>
                        <Link href={m.cta.href} className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#003856] hover:gap-2">
                          {m.cta.label} <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
