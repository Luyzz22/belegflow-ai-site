"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid } from "recharts";
import { useAuth } from "@/lib/useAuth";

const API = "https://app.sbsdeutschland.com/api/erechnung";
const LABELS: Record<string,string> = { uploaded:"Hochgeladen", classified:"Klassifiziert", validated:"Validiert", suggested:"KI-Vorschlag", approved:"Freigegeben", exported:"Exportiert", archived:"Archiviert", rejected:"Abgelehnt", error:"Fehler" };

export default function AnalyticsPage() {
  const { user, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(90);

  useEffect(() => { if (token) load(); }, [period, token]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(API + "/analytics/dashboard?days=" + period, { headers: { "X-Tenant-ID": user?.tenant_id || "", Authorization: "Bearer " + token } });
      if (r.ok) setData(await r.json());
    } catch {} finally { setLoading(false); }
  };

  const fmtW = (w: string) => { const d = new Date(w); return d.getDate() + "." + (d.getMonth() + 1); };

  if (loading) return (
    <div className="min-h-screen bg-[#f4f7fa] text-gray-900 flex items-center justify-center">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{animationDelay:"0ms"}} />
        <div className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{animationDelay:"150ms"}} />
        <div className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{animationDelay:"300ms"}} />
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-[#f4f7fa] text-gray-900 flex items-center justify-center">
      <button onClick={load} className="px-4 py-2 bg-[#e85d04] rounded-lg text-sm">Erneut laden</button>
    </div>
  );

  const { kpis: k, status_distribution: sd, timeline: tl, kontierung_performance: kp, recent_activity: ra, processing_speed: ps } = data;
  const conf = [
    { name: "Hoch (>85%)", value: kp.confidence_distribution.high, color: "#10b981" },
    { name: "Mittel", value: kp.confidence_distribution.medium, color: "#f59e0b" },
    { name: "Niedrig", value: kp.confidence_distribution.low, color: "#ef4444" },
  ].filter((d: any) => d.value > 0);

  return (
    <div className="min-h-screen bg-[#f4f7fa] text-gray-900">
      <div className="border-b border-white/[0.06] bg-[#f4f7fa]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-gray-500 hover:text-gray-900 transition">&larr; Dashboard</a>
            <div className="h-6 w-px bg-[#262626]" />
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-lg">📊</div>
              <div><h1 className="text-lg font-semibold">Analytics</h1><p className="text-xs text-gray-500">Rechnungseingang</p></div>
            </div>
          </div>
          <div className="flex gap-2">
            {[30, 90, 180].map(d => (
              <button key={d} onClick={() => setPeriod(d)}
                className={"px-3 py-1.5 rounded-lg text-xs font-medium transition " + (period === d ? "bg-[#e85d04] text-gray-900" : "bg-white text-gray-500 border border-gray-200")}>
                {d}T
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { l: "Gesamt", v: k.total_invoices, i: "📄" },
            { l: period + "T", v: k.period_invoices, i: "📅" },
            { l: "Offen", v: k.pending_review, i: "⏳", a: k.pending_review > 0 },
            { l: "Freigegeben", v: k.approved, i: "✅" },
            { l: "Exportiert", v: k.exported, i: "📤" },
            { l: "Quote", v: k.completion_rate + "%", i: "📈" },
            { l: "Speed", v: ps.formatted, i: "⚡" },
          ].map((x, i) => (
            <div key={i} className={"rounded-xl p-4 border " + (x.a ? "bg-amber-500/5 border-amber-500/20" : "bg-white/50 border-gray-200")}>
              <span className="text-lg">{x.i}</span>
              <div className="text-2xl font-bold mt-1">{x.v}</div>
              <div className="text-xs text-gray-500 mt-1">{x.l}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/50 border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Rechnungseingang pro Woche</h3>
            {tl.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={tl}>
                  <defs><linearGradient id="cC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#e85d04" stopOpacity={0.3} /><stop offset="95%" stopColor="#e85d04" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="week" tickFormatter={fmtW} stroke="#525252" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#525252" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#171717", border: "1px solid #262626", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="count" stroke="#e85d04" fill="url(#cC)" strokeWidth={2} name="Rechnungen" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">Keine Daten</div>}
          </div>
          <div className="bg-white/50 border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Status-Verteilung</h3>
            {sd.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart><Pie data={sd} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}
                  label={({ status, count }: any) => (LABELS[status] || status) + " (" + count + ")"}>
                  {sd.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                </Pie><Tooltip contentStyle={{ background: "#171717", border: "1px solid #262626", borderRadius: 8, fontSize: 12 }} /></PieChart>
              </ResponsiveContainer>
            ) : <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">Keine Daten</div>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/50 border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">KI-Kontierung</h3>
            <p className="text-xs text-gray-400 mb-4">{kp.total} Kontierungen | Confidence: {(kp.avg_confidence * 100).toFixed(0)}%</p>
            {conf.length > 0 && (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart><Pie data={conf} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                  {conf.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                </Pie><Legend verticalAlign="bottom" iconSize={8} /><Tooltip contentStyle={{ background: "#171717", border: "1px solid #262626", borderRadius: 8, fontSize: 12 }} /></PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-white/50 border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Sachkonten (SKR03)</h3>
            {kp.top_konten.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={kp.top_konten} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                  <XAxis type="number" stroke="#525252" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="konto" stroke="#525252" tick={{ fontSize: 12 }} width={60} />
                  <Tooltip contentStyle={{ background: "#171717", border: "1px solid #262626", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#e85d04" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">Keine Daten</div>}
          </div>
        </div>

        <div className="bg-white/50 border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Letzte Aktivit&auml;ten</h3>
          <div className="space-y-2">
            {ra.map((a: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#262626]/50 transition">
                <span className="text-sm font-mono">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-700 truncate">{a.file_name || a.document_id}</span>
                  {a.to && <span className="text-xs px-2 py-0.5 rounded-full bg-[#262626] text-gray-500 ml-2">&rarr; {LABELS[a.to] || a.to}</span>}
                  <div className="text-xs text-gray-400">{a.actor} | {a.timestamp ? new Date(a.timestamp).toLocaleString("de-DE") : ""}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
