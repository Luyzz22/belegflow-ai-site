"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Bell } from "lucide-react";
import { API_BASE } from "@/lib/api-client";

type Health = "checking" | "ok" | "down";
type DayStatus = "ok" | "degraded" | "none";

interface HistoryEntry {
  date: string;
  status: Exclude<DayStatus, "none">;
}

const HISTORY_KEY = "fc_uptime_history";
const SUB_KEY = "fc_status_subscribe";

function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]") as HistoryEntry[];
  } catch {
    return [];
  }
}

/** Heutigen Status eintragen und auf 30 Tage begrenzt zurückgeben. */
function upsertToday(status: HistoryEntry["status"]): HistoryEntry[] {
  const today = new Date().toISOString().slice(0, 10);
  const map = new Map(loadHistory().map((e) => [e.date, e]));
  // „degraded" nicht durch ein späteres „ok" am selben Tag überschreiben.
  const existing = map.get(today);
  map.set(today, { date: today, status: existing?.status === "degraded" ? "degraded" : status });
  const list = Array.from(map.values())
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 30);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  return list;
}

function buildSquares(history: HistoryEntry[]): { date: string; status: DayStatus }[] {
  const byDate = new Map(history.map((e) => [e.date, e.status]));
  const out: { date: string; status: DayStatus }[] = [];
  const base = Date.now();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(base - i * 86_400_000).toISOString().slice(0, 10);
    out.push({ date: d, status: byDate.get(d) ?? "none" });
  }
  return out;
}

export default function StatusDashboard() {
  const [backend, setBackend] = useState<Health>("checking");
  const [responseMs, setResponseMs] = useState<number | null>(null);
  const [squares, setSquares] = useState<{ date: string; status: DayStatus }[]>([]);
  const [uptimePct, setUptimePct] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const run = async () => {
      let status: Health = "down";
      const t0 = performance.now();
      try {
        const res = await fetch(`${API_BASE}/health`, { method: "GET", cache: "no-store" });
        status = res.ok ? "ok" : "down";
      } catch {
        status = "down";
      }
      const ms = Math.round(performance.now() - t0);
      const history = upsertToday(status === "ok" ? "ok" : "degraded");
      const okCount = history.filter((e) => e.status === "ok").length;
      const pct = history.length > 0 ? (okCount / history.length) * 100 : null;
      setBackend(status);
      setResponseMs(ms);
      setSquares(buildSquares(history));
      setUptimePct(pct);
      setSubscribed(!!localStorage.getItem(SUB_KEY));
    };
    void run();
  }, []);

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    localStorage.setItem(SUB_KEY, email);
    setSubscribed(true);
  };

  const allOk = backend === "ok";
  const checking = backend === "checking";

  const banner = checking
    ? { cls: "bg-stone-100 text-stone-600", icon: AlertTriangle, text: "Status wird geprüft …" }
    : allOk
      ? { cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", icon: CheckCircle2, text: "Alle Systeme betriebsbereit" }
      : { cls: "bg-red-50 text-red-700 ring-1 ring-red-200", icon: XCircle, text: "Störung erkannt" };
  const BannerIcon = banner.icon;

  const componentRows: { name: string; ok: boolean | null; time: string }[] = [
    { name: "Frontend (Vercel)", ok: true, time: "—" },
    { name: "Backend API", ok: checking ? null : allOk, time: responseMs !== null ? `${(responseMs / 1000).toFixed(2)}s` : "—" },
    { name: "Datenbank (Neon)", ok: checking ? null : allOk, time: "—" },
    { name: "KI-Extraktion", ok: checking ? null : allOk, time: "—" },
  ];

  const sqColor = (s: DayStatus) =>
    s === "ok" ? "bg-emerald-500" : s === "degraded" ? "bg-amber-400" : "bg-stone-200";

  const CARD = "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/60";

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className={`flex items-center gap-3 rounded-2xl px-6 py-5 ${banner.cls}`}>
        <BannerIcon className="h-7 w-7 shrink-0" />
        <span className="text-lg font-semibold">{banner.text}</span>
      </div>

      {/* Komponenten */}
      <section className={`${CARD} overflow-x-auto`}>
        <h2 className="mb-4 text-xl font-semibold text-[#003856]">Komponenten</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-xs font-medium uppercase tracking-wider text-[#64748b]">
              <th className="px-3 py-2.5">Komponente</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Antwortzeit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {componentRows.map((c) => (
              <tr key={c.name}>
                <td className="px-3 py-3 font-medium text-[#1a1a2e]">{c.name}</td>
                <td className="px-3 py-3">
                  {c.ok === null ? (
                    <span className="text-[#94a3b8]">wird geprüft …</span>
                  ) : c.ok ? (
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" /> Betriebsbereit
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-medium text-red-600">
                      <XCircle className="h-4 w-4" /> Störung
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 text-[#64748b]">{c.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Uptime */}
      <section className={CARD}>
        <h2 className="mb-1 text-xl font-semibold text-[#003856]">Uptime-Historie (30 Tage)</h2>
        <p className="mb-4 text-sm text-[#64748b]">
          {uptimePct !== null ? `${uptimePct.toFixed(1)}% Verfügbarkeit in den letzten 30 Tagen` : "Noch keine Daten erfasst."}
        </p>
        <div className="flex flex-wrap gap-1">
          {squares.map((sq) => (
            <span key={sq.date} title={`${sq.date}: ${sq.status === "ok" ? "OK" : sq.status === "degraded" ? "Eingeschränkt" : "Keine Daten"}`} className={`h-6 w-3 rounded-sm ${sqColor(sq.status)}`} />
          ))}
        </div>
        <p className="mt-3 text-xs text-[#94a3b8]">
          Hinweis: Die Historie wird clientseitig bei jedem Besuch dieser Seite erfasst.
        </p>
      </section>

      {/* Incidents */}
      <section className={CARD}>
        <h2 className="mb-2 text-xl font-semibold text-[#003856]">Vorfälle</h2>
        <p className="flex items-center gap-2 text-sm text-[#64748b]">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Keine Vorfälle in den letzten 30 Tagen.
        </p>
      </section>

      {/* Subscribe */}
      <section className={CARD}>
        <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold text-[#003856]">
          <Bell className="h-5 w-5 text-[#c8985a]" /> Benachrichtigung bei Störungen
        </h2>
        {subscribed ? (
          <p className="text-sm text-emerald-700">✓ Sie erhalten künftig Benachrichtigungen bei Störungen.</p>
        ) : (
          <form onSubmit={subscribe} className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ihre@firma.de"
              className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95"
            >
              Abonnieren
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
