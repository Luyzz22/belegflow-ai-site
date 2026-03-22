"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";

const API = process.env.NEXT_PUBLIC_API_URL || "https://app.sbsdeutschland.com/api/erechnung";

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!token) return;
    const h = { Authorization: `Bearer ${token}`, "X-Tenant-ID": user?.tenant_id || "" };
    Promise.all([
      fetch(`${API}/analytics/dashboard?days=90`, { headers: h }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API}/invoices`, { headers: h }).then(r => r.json()).catch(() => []),
    ]).then(([s, inv]) => {
      setStats(s);
      const list = Array.isArray(inv) ? inv : inv?.items || [];
      setInvoices(list);
      if (list.length === 0) setShowOnboarding(true);
      setLoading(false);
    });
  }, [token, user]);

  if (!user) return null;

  const totalSpend = invoices.reduce((s, i) => s + (Number(i.total_amount) || 0), 0);
  const suggested = invoices.filter(i => i.current_state === "suggested").length;
  const approved = invoices.filter(i => ["approved", "exported"].includes(i.current_state)).length;
  const pending = invoices.filter(i => ["suggested", "validated", "classified"].includes(i.current_state)).length;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Guten Morgen";
    if (h < 18) return "Guten Tag";
    return "Guten Abend";
  })();

  const modules = [
    { href: "/dashboard/rechnungen", icon: "📄", title: "Rechnungen", desc: "Upload & KI-Verarbeitung", stat: `${invoices.length} Belege`, color: "#e85d04" },
    { href: "/dashboard/freigaben", icon: "✅", title: "Freigaben", desc: "Rechnungsfreigabe", stat: `${pending} ausstehend`, color: "#10b981" },
    { href: "/dashboard/analytics", icon: "📈", title: "Analytics", desc: "KPIs & Charts", stat: "Live-Daten", color: "#8b5cf6" },
    { href: "/dashboard/spend", icon: "💰", title: "Spend Analytics", desc: "Ausgabenanalyse", stat: totalSpend > 0 ? `${totalSpend.toLocaleString("de-DE")}€` : "—", color: "#f59e0b" },
    { href: "/dashboard/budget", icon: "📋", title: "Budget", desc: "Jahresplanung", stat: "2026", color: "#3b82f6" },
    { href: "/dashboard/copilot", icon: "🤖", title: "Finance Copilot", desc: "KI-Assistent", stat: "Gemini + Claude", color: "#06b6d4" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="px-6 py-8" style={{ background: "linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%)" }}>
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-2xl font-bold text-white">{greeting}, {user?.name || user?.email?.split("@")[0]}!</h1>
          <p className="text-white/70 text-sm mt-1">Ihre BelegFlow AI Übersicht.</p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 -mt-6 pb-12 space-y-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex gap-1.5">{[0,150,300].map(d => <div key={d} className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}</div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Rechnungen", value: invoices.length, icon: "📄", trend: stats?.invoice_trend },
                { label: "KI-Vorschläge", value: suggested, icon: "🤖", color: "#8b5cf6" },
                { label: "Freigegeben", value: approved, icon: "✅", color: "#10b981" },
                { label: "Gesamtausgaben", value: totalSpend.toLocaleString("de-DE", { style: "currency", currency: "EUR" }), icon: "💰", color: "#f59e0b" },
              ].map((kpi, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{kpi.icon}</span>
                    {kpi.trend && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+{kpi.trend}%</span>}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Onboarding */}
            {showOnboarding && (
              <div className="bg-white rounded-2xl border border-[#FFB900]/30 p-6 shadow-sm" style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)" }}>
                <h2 className="text-lg font-bold text-gray-900 mb-3">🚀 Starten Sie in 3 Schritten</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { n: "1", title: "Rechnung hochladen", desc: "PDF, XML oder E-Rechnung — die KI erkennt alles.", href: "/dashboard/rechnungen", cta: "Jetzt hochladen →", color: "#e85d04" },
                    { n: "2", title: "KI-Copilot testen", desc: "Fragen Sie die KI nach Kontierungen oder Trends.", href: "/dashboard/copilot", cta: "Copilot öffnen →", color: "#10b981" },
                    { n: "3", title: "Team einladen", desc: "Laden Sie Ihr Team ein und weisen Sie Rollen zu.", href: "/dashboard/settings", cta: "Team verwalten →", color: "#8b5cf6" },
                  ].map((step) => (
                    <a key={step.n} href={step.href} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 hover:shadow-md transition block">
                      <div className="w-7 h-7 rounded-lg text-white text-xs font-bold flex items-center justify-center mb-3" style={{ background: step.color }}>{step.n}</div>
                      <h3 className="text-sm font-semibold text-gray-900">{step.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{step.desc}</p>
                      <span className="text-xs font-medium mt-2 inline-block" style={{ color: step.color }}>{step.cta}</span>
                    </a>
                  ))}
                </div>
                <button onClick={() => setShowOnboarding(false)} className="text-xs text-gray-400 hover:text-gray-600 mt-3">Ausblenden</button>
              </div>
            )}

            {/* Module Grid */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Module</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((m, i) => (
                  <a key={i} href={m.href} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition group block">
                    <div className="flex items-start justify-between">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: `${m.color}15` }}>
                        {m.icon}
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{m.stat}</span>
                    </div>
                    <h3 className="text-[15px] font-semibold text-gray-900 mt-3 group-hover:text-[#003856] transition">{m.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                  </a>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            {invoices.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">📋 Letzte Rechnungen</h2>
                  <a href="/dashboard/rechnungen" className="text-xs text-[#e85d04] hover:text-[#f48c06] font-medium">Alle anzeigen →</a>
                </div>
                <div className="space-y-2">
                  {invoices.slice(0, 5).map((inv, i) => (
                    <a key={i} href={`/dashboard/rechnungen/${inv.document_id}`}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#00385610] flex items-center justify-center text-sm">📄</div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{inv.supplier || inv.file_name}</p>
                          <p className="text-[11px] text-gray-400">{inv.invoice_number || inv.file_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {inv.total_amount && <p className="text-sm font-semibold text-gray-900">{Number(inv.total_amount).toLocaleString("de-DE", { style: "currency", currency: inv.currency || "EUR" })}</p>}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          inv.current_state === "approved" ? "bg-green-50 text-green-700" :
                          inv.current_state === "suggested" ? "bg-violet-50 text-violet-700" :
                          inv.current_state === "exported" ? "bg-blue-50 text-blue-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>{inv.current_state}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { href: "/dashboard/rechnungen", label: "Rechnung hochladen", icon: "⬆️" },
                { href: "/dashboard/copilot", label: "KI fragen", icon: "💬" },
                { href: "/dashboard/analytics", label: "Reports ansehen", icon: "📈" },
                { href: "/dashboard/settings", label: "Einstellungen", icon: "⚙️" },
              ].map((a, i) => (
                <a key={i} href={a.href} className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:shadow-md hover:border-gray-300 transition">
                  <span className="text-lg">{a.icon}</span>
                  <span className="text-sm text-gray-700 font-medium">{a.label}</span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
