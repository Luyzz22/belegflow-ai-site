"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";

const API = "https://app.sbsdeutschland.com/api/erechnung";

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const [usage, setUsage] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!token) return;
    const h = { Authorization: "Bearer " + token, "X-Tenant-ID": user?.tenant_id || "" };
    fetch(API+"/billing/usage",{headers:h}).then(r=>r.json()).then(d=>{
      setUsage(d); if(d.used===0 && !localStorage.getItem("bf_onboarding_done")) setShowOnboarding(true);
    }).catch(()=>{});
    fetch(API+"/analytics/dashboard?days=30",{headers:h}).then(r=>r.json()).then(setAnalytics).catch(()=>{});
  },[token,user]);

  const dismissOnboarding = () => { setShowOnboarding(false); localStorage.setItem("bf_onboarding_done","1"); };
  if(!user) return null;

  const modules = [
    {href:"/dashboard/rechnungen",icon:"\ud83d\udcc4",title:"Rechnungen",desc:"Upload & Verarbeitung",color:"from-[#e85d04] to-[#f48c06]"},
    {href:"/dashboard/analytics",icon:"\ud83d\udcca",title:"Analytics",desc:"KPIs & Charts",color:"from-violet-500 to-purple-600"},
    {href:"/dashboard/copilot",icon:"\ud83e\udd16",title:"Finance Copilot",desc:"KI-Chat",color:"from-emerald-500 to-green-600"},
    {href:"/dashboard/spend",icon:"\ud83d\udcb0",title:"Spend Analytics",desc:"Ausgabenanalyse",color:"from-amber-500 to-orange-600"},
    {href:"/dashboard/freigaben",icon:"\u2705",title:"Freigaben",desc:"Rechnungsfreigabe",color:"from-teal-500 to-emerald-600"},
    {href:"/dashboard/budget",icon:"\ud83d\udccb",title:"Budget",desc:"Jahresplanung",color:"from-blue-500 to-indigo-600"},
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="fixed top-0 left-0 right-0 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.06] z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e85d04] rounded-lg flex items-center justify-center font-bold text-white text-xs">BF</div>
            <span className="text-lg font-bold hidden sm:block" style={{fontFamily:"'Instrument Serif',serif"}}>BelegFlow AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {modules.map((m,i)=>(<a key={i} href={m.href} className="px-3 py-1.5 text-sm text-[#a3a3a3] hover:text-white hover:bg-[#171717] rounded-lg transition">{m.icon} {m.title}</a>))}
            <a href="/dashboard/settings" className="px-3 py-1.5 text-sm text-[#a3a3a3] hover:text-white hover:bg-[#171717] rounded-lg transition">⚙️ Settings</a>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#737373] hidden sm:block">{user.name}</span>
            <button onClick={logout} className="text-xs text-[#525252] hover:text-white px-2 py-1 rounded transition">Logout</button>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-24 md:pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
        {showOnboarding && (
          <div className="mb-8 bg-gradient-to-r from-[#e85d04]/10 to-[#171717] border border-[#e85d04]/20 rounded-2xl p-6 sm:p-8">
            <div className="flex items-start justify-between mb-4">
              <div><h2 className="text-xl font-bold mb-1">Willkommen bei BelegFlow AI! 🎉</h2><p className="text-[#a3a3a3] text-sm">In 3 Schritten zur automatisierten Rechnungsverarbeitung</p></div>
              <button onClick={dismissOnboarding} className="text-[#525252] hover:text-white text-sm">✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              {[
                {href:"/dashboard/rechnungen",n:"1",c:"bg-[#e85d04]",t:"Rechnung hochladen",d:"PDF, XML oder E-Rechnung — die KI erkennt alles.",a:"Jetzt hochladen →",ac:"text-[#e85d04]"},
                {href:"/dashboard/copilot",n:"2",c:"bg-emerald-600",t:"KI-Copilot testen",d:"Fragen Sie die KI nach Kontierungen oder Trends.",a:"Copilot öffnen →",ac:"text-emerald-400"},
                {href:"/dashboard/settings",n:"3",c:"bg-violet-600",t:"Team einladen",d:"Laden Sie Ihr Team ein und weisen Sie Rollen zu.",a:"Team verwalten →",ac:"text-violet-400"},
              ].map((s,i)=>(
                <a key={i} href={s.href} className="group bg-[#0a0a0a]/50 border border-[#262626] rounded-xl p-5 hover:border-[#404040] transition">
                  <div className="flex items-center gap-3 mb-3"><div className={"w-8 h-8 rounded-full "+s.c+" flex items-center justify-center text-sm font-bold"}>{s.n}</div><span className="text-sm font-semibold">{s.t}</span></div>
                  <p className="text-xs text-[#737373]">{s.d}</p><span className={"text-xs mt-3 block group-hover:underline "+s.ac}>{s.a}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Willkommen, {user.name.split(" ")[0]}!</h1>
          <p className="text-[#737373] mt-1 text-sm">Ihr E-Rechnungs-Dashboard</p>
        </div>

        {/* Live KPIs */}
        {analytics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              {l:"Rechnungen",v:analytics.kpis.total_invoices,i:"📄"},
              {l:"Diesen Monat",v:analytics.kpis.period_invoices,i:"📅"},
              {l:"Freigegeben",v:analytics.kpis.approved,i:"✅"},
              {l:"Abschlussquote",v:analytics.kpis.completion_rate+"%",i:"📈"},
            ].map((k,i)=>(
              <div key={i} className="bg-[#171717]/50 border border-[#262626] rounded-xl p-4">
                <span className="text-lg">{k.i}</span>
                <div className="text-2xl font-bold mt-1">{k.v}</div>
                <div className="text-xs text-[#737373] mt-1">{k.l}</div>
              </div>
            ))}
          </div>
        )}

        {/* Usage Banner */}
        {usage && (
          <div className="mb-6 bg-[#171717]/50 border border-[#262626] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#737373]">Rechnungen diesen Monat:</span>
              <span className="text-sm font-semibold">{usage.used} / {usage.limit==="unlimited"?"∞":usage.limit}</span>
            </div>
            {usage.limit!=="unlimited"&&<div className="w-32 bg-[#262626] rounded-full h-2 hidden sm:block"><div className="bg-[#e85d04] h-2 rounded-full" style={{width:Math.min(100,(usage.used/usage.limit)*100)+"%"}}/></div>}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
          {modules.map((m,i)=>(
            <a key={i} href={m.href} className={"bg-gradient-to-br "+m.color+" p-5 rounded-xl text-white hover:scale-[1.02] transition-transform"}>
              <span className="text-2xl">{m.icon}</span><p className="font-semibold mt-2">{m.title}</p><p className="text-xs opacity-80 mt-0.5">{m.desc}</p>
            </a>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[#737373] uppercase tracking-wider mb-3">Schnellzugriff</h2>
          <div className="flex flex-wrap gap-2">
            {[{href:"/dashboard/rechnungen",label:"Rechnung hochladen",icon:"⬆️"},{href:"/dashboard/copilot",label:"KI fragen",icon:"💬"},{href:"/dashboard/analytics",label:"Reports",icon:"📈"},{href:"/dashboard/settings",label:"Einstellungen",icon:"⚙️"}].map((a,i)=>(
              <a key={i} href={a.href} className="flex items-center gap-2 px-4 py-2 bg-[#171717]/50 border border-[#262626] rounded-lg text-sm text-[#d4d4d4] hover:text-white hover:border-[#404040] transition"><span>{a.icon}</span>{a.label}</a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#171717]/50 border border-[#262626] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#d4d4d4] mb-4">Systemstatus</h3>
            {[{l:"E-Rechnungs API",s:"live",d:"v1.2.0"},{l:"KI-Kontierung",s:"live",d:"Gemini + Claude"},{l:"DATEV Export",s:"live",d:"SKR03 nativ"},{l:"Email Ingestion",s:"active",d:"5 Min"},{l:"GoBD",s:"live",d:"SHA-256 Chain"}].map((s,i)=>(
              <div key={i} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-[#d4d4d4]">{s.l}</span>
                <div className="flex items-center gap-2"><span className="text-xs text-[#525252]">{s.d}</span><span className={"w-2 h-2 rounded-full "+(s.s==="live"?"bg-emerald-400":"bg-amber-400")}/></div>
              </div>
            ))}
          </div>
          <div className="bg-[#171717]/50 border border-[#262626] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#d4d4d4]">Letzte Aktivitäten</h3>
              <a href="/dashboard/analytics" className="text-xs text-[#e85d04] hover:text-[#f48c06]">Alle →</a>
            </div>
            {analytics?.recent_activity?.slice(0,5).map((a:any,i:number)=>(
              <div key={i} className="flex items-center gap-3 py-2">
                <span className="text-sm">{a.icon||"📄"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#d4d4d4] truncate">{a.file_name||a.document_id}</p>
                  <p className="text-xs text-[#525252]">{a.actor} · {a.timestamp?new Date(a.timestamp).toLocaleDateString("de-DE"):""}</p>
                </div>
              </div>
            )) || <div className="text-center py-6"><a href="/dashboard/analytics" className="text-sm text-[#e85d04]">📊 Analytics öffnen</a></div>}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/[0.06] md:hidden z-50">
        <div className="flex justify-around py-2">
          {[...modules,{href:"/dashboard/settings",icon:"⚙️",title:"Settings",desc:"",color:""}].map((m,i)=>(
            <a key={i} href={m.href} className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#737373] hover:text-white transition"><span className="text-lg">{m.icon}</span><span className="text-[10px]">{m.title}</span></a>
          ))}
        </div>
      </div>
    </div>
  );
}
