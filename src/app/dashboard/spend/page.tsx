"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, AreaChart, Area } from "recharts";
import { useAuth } from "@/lib/useAuth";

const API = process.env.NEXT_PUBLIC_API_URL || "https://app.sbsdeutschland.com/api/erechnung";

export default function SpendAnalyticsPage() {
  const { user, token } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"overview"|"suppliers"|"trend">("overview");

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/invoices`, { headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": user?.tenant_id || "" }})
      .then(r => r.json()).then(d => { setInvoices(Array.isArray(d) ? d : d.items || []); setLoading(false); }).catch(() => setLoading(false));
  }, [token, user]);

  if (!user) return null;

  const bySupplier: Record<string, { count: number; total: number }> = {};
  let totalSpend = 0;
  invoices.forEach(inv => {
    const s = inv.supplier || "Unbekannt";
    if (!bySupplier[s]) bySupplier[s] = { count: 0, total: 0 };
    bySupplier[s].count++;
    const amt = Number(inv.total_amount) || 0;
    bySupplier[s].total += amt;
    totalSpend += amt;
  });
  const supplierData = Object.entries(bySupplier).map(([name, d]) => ({ name: name.length > 22 ? name.slice(0, 22) + "…" : name, fullName: name, ...d })).sort((a, b) => b.total - a.total);
  const colors = ["#e85d04", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#6366f1"];

  const byMonth: Record<string, number> = {};
  invoices.forEach(inv => { const d = inv.invoice_date || inv.created_at || inv.uploaded_at; if (d) { const m = d.slice(0, 7); byMonth[m] = (byMonth[m] || 0) + (Number(inv.total_amount) || 0); }});
  const monthlyData = Object.entries(byMonth).sort().map(([m, v]) => ({ month: m.slice(5) + "/" + m.slice(2, 4), amount: Math.round(v * 100) / 100 }));

  const avgPerInvoice = invoices.length > 0 ? totalSpend / invoices.length : 0;
  const topSupplier = supplierData[0];
  const tabs = [{ key: "overview", label: "Übersicht" }, { key: "suppliers", label: "Lieferanten" }, { key: "trend", label: "Trend" }] as const;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-[#737373] hover:text-white transition text-sm">← Dashboard</a>
            <div className="h-5 w-px bg-[#262626]" />
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-base">💰</div>
              <div><h1 className="text-base font-semibold leading-tight">Spend Analytics</h1><p className="text-[11px] text-[#525252]">Ausgabenanalyse</p></div>
            </div>
          </div>
          <div className="flex gap-1 bg-[#171717] border border-[#262626] rounded-lg p-0.5">
            {tabs.map(t => (<button key={t.key} onClick={() => setView(t.key as any)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${view === t.key ? "bg-[#e85d04] text-white" : "text-[#737373] hover:text-white"}`}>{t.label}</button>))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {loading ? (<div className="flex justify-center py-24"><div className="flex gap-1.5">{[0, 150, 300].map(d => (<div key={d} className="w-2.5 h-2.5 bg-[#e85d04] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />))}</div></div>) : (<>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[{ l: "Gesamtausgaben", v: totalSpend.toLocaleString("de-DE", { style: "currency", currency: "EUR" }), s: `${invoices.length} Rechnungen`, a: "from-amber-500/20 to-orange-500/10" },
              { l: "Ø pro Rechnung", v: avgPerInvoice.toLocaleString("de-DE", { style: "currency", currency: "EUR" }), s: "Durchschnitt", a: "from-violet-500/20 to-purple-500/10" },
              { l: "Lieferanten", v: String(Object.keys(bySupplier).length), s: topSupplier ? `Top: ${topSupplier.fullName}` : "—", a: "from-emerald-500/20 to-green-500/10" },
              { l: "Top-Ausgabe", v: topSupplier ? topSupplier.total.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) : "—", s: topSupplier ? `${topSupplier.count} Rechnungen` : "—", a: "from-rose-500/20 to-red-500/10" }
            ].map((k, i) => (<div key={i} className={`relative overflow-hidden bg-gradient-to-br ${k.a} border border-[#262626] rounded-xl p-5`}><p className="text-[11px] text-[#737373] uppercase tracking-wider font-medium">{k.l}</p><p className="text-xl font-bold mt-1.5 tracking-tight">{k.v}</p><p className="text-[11px] text-[#525252] mt-1 truncate">{k.s}</p></div>))}
          </div>
          {view === "overview" && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6"><h3 className="text-sm font-semibold text-[#a3a3a3] mb-5">Top Lieferanten</h3>
              {supplierData.length > 0 ? (<ResponsiveContainer width="100%" height={280}><BarChart data={supplierData.slice(0, 6)} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" horizontal={false} /><XAxis type="number" stroke="#404040" tick={{ fontSize: 10, fill: "#525252" }} /><YAxis type="category" dataKey="name" stroke="#404040" tick={{ fontSize: 11, fill: "#737373" }} width={130} /><Tooltip contentStyle={{ background: "#171717", border: "1px solid #262626", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => v.toLocaleString("de-DE", { style: "currency", currency: "EUR" })} /><Bar dataKey="total" fill="#e85d04" radius={[0, 6, 6, 0]} barSize={18} /></BarChart></ResponsiveContainer>) : <div className="h-[280px] flex items-center justify-center text-[#525252] text-sm">Keine Daten</div>}
            </div>
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6"><h3 className="text-sm font-semibold text-[#a3a3a3] mb-5">Verteilung</h3>
              {supplierData.length > 0 ? (<ResponsiveContainer width="100%" height={280}><PieChart><Pie data={supplierData.slice(0, 6)} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={100} paddingAngle={3} strokeWidth={0}>{supplierData.slice(0, 6).map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip contentStyle={{ background: "#171717", border: "1px solid #262626", borderRadius: 8 }} /></PieChart></ResponsiveContainer>) : <div className="h-[280px] flex items-center justify-center text-[#525252] text-sm">Keine Daten</div>}
            </div>
          </div>)}
          {view === "trend" && monthlyData.length > 0 && (<div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6"><h3 className="text-sm font-semibold text-[#a3a3a3] mb-5">Monatlicher Trend</h3><ResponsiveContainer width="100%" height={300}><AreaChart data={monthlyData}><defs><linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e85d04" stopOpacity={0.3} /><stop offset="100%" stopColor="#e85d04" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" /><XAxis dataKey="month" stroke="#404040" tick={{ fontSize: 11, fill: "#525252" }} /><YAxis stroke="#404040" tick={{ fontSize: 11, fill: "#525252" }} /><Tooltip contentStyle={{ background: "#171717", border: "1px solid #262626", borderRadius: 8 }} /><Area type="monotone" dataKey="amount" stroke="#e85d04" strokeWidth={2} fill="url(#colorAmt)" /></AreaChart></ResponsiveContainer></div>)}
          {view === "suppliers" && (<div className="bg-[#141414] border border-[#1f1f1f] rounded-xl overflow-hidden"><div className="px-6 py-4 border-b border-[#1f1f1f]"><h3 className="text-sm font-semibold text-[#a3a3a3]">Alle Lieferanten ({supplierData.length})</h3></div><div className="divide-y divide-[#1f1f1f]">{supplierData.map((s, i) => (<div key={i} className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-[#1a1a1a] transition items-center"><div className="col-span-1"><div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ background: colors[i % colors.length] + "22", color: colors[i % colors.length] }}>{i + 1}</div></div><div className="col-span-5 text-sm truncate">{s.fullName}</div><div className="col-span-2 text-right text-sm text-[#737373]">{s.count}</div><div className="col-span-2 text-right text-sm font-medium">{s.total.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</div><div className="col-span-2 text-right text-xs text-[#525252]">{totalSpend > 0 ? Math.round(s.total / totalSpend * 100) : 0}%</div></div>))}</div></div>)}
        </>)}
      </div>
    </div>
  );
}
