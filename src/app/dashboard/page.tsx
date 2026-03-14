"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";

const API = "https://app.sbsdeutschland.com/api/erechnung";

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const [usage, setUsage] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(API+"/billing/usage",{headers:{Authorization:"Bearer "+token}}).then(r=>r.json()).then(d=>{
      setUsage(d);
      if(d.used===0) setShowOnboarding(true);
    }).catch(()=>{});
    const seen = localStorage.getItem("bf_onboarding_done");
    if(seen) setShowOnboarding(false);
  },[token]);

  const dismissOnboarding = () => { setShowOnboarding(false); localStorage.setItem("bf_onboarding_done","1"); };

  if(!user) return null;

  const modules = [
    {href:"/dashboard/rechnungen",icon:"\ud83d\udcc4",title:"Rechnungen",desc:"Upload & Verarbeitung",color:"from-[#e85d04] to-[#f48c06]"},
    {href:"/dashboard/analytics",icon:"\ud83d\udcca",title:"Analytics",desc:"KPIs & Charts",color:"from-violet-500 to-purple-600"},
    {href:"/dashboard/copilot",icon:"\ud83e\udd16",title:"Finance Copilot",desc:"KI-Chat",color:"from-emerald-500 to-green-600"},
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="fixed top-0 left-0 right-0 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.06] z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#e85d04] rounded-lg flex items-center justify-center font-bold text-white text-xs">BF</div>
              <span className="text-lg font-bold hidden sm:block" style={{fontFamily:"'Instrument Serif',serif"}}>BelegFlow AI</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {modules.map((m,i)=>(
              <a key={i} href={m.href} className="px-3 py-1.5 text-sm text-[#a3a3a3] hover:text-white hover:bg-[#171717] rounded-lg transition">{m.icon} {m.title}</a>
            ))}
            <a href="/dashboard/settings" className="px-3 py-1.5 text-sm text-[#a3a3a3] hover:text-white hover:bg-[#171717] rounded-lg transition">⚙️ Settings</a>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#737373] hidden sm:block">{user.name}</span>
            <button onClick={logout} className="text-xs text-[#525252] hover:text-white px-2 py-1 rounded transition">Logout</button>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-24 md:pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Onboarding Wizard */}
        {showOnboarding && (
          <div className="mb-8 bg-gradient-to-r from-[#e85d04]/10 to-[#171717] border border-[#e85d04]/20 rounded-2xl p-6 sm:p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold mb-1">Willkommen bei BelegFlow AI! 🎉</h2>
                <p className="text-[#a3a3a3] text-sm">In 3 Schritten zur automatisierten Rechnungsverarbeitung</p>
              </div>
              <button onClick={dismissOnboarding} className="text-[#525252] hover:text-white text-sm">✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <a href="/dashboard/rechnungen" className="group bg-[#0a0a0a]/50 border border-[#262626] rounded-xl p-5 hover:border-[#e85d04]/30 transition">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#e85d04] flex items-center justify-center text-sm font-bold">1</div>
                  <span className="text-sm font-semibold">Rechnung hochladen</span>
                </div>
                <p className="text-xs text-[#737373]">PDF, XML oder E-Rechnung — die KI erkennt alles in unter 3 Sekunden.</p>
                <span className="text-xs text-[#e85d04] mt-3 block group-hover:underline">Jetzt hochladen →</span>
              </a>
              <a href="/dashboard/copilot" className="group bg-[#0a0a0a]/50 border border-[#262626] rounded-xl p-5 hover:border-emerald-500/30 transition">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold">2</div>
                  <span className="text-sm font-semibold">KI-Copilot testen</span>
                </div>
                <p className="text-xs text-[#737373]">Fragen Sie die KI nach Ihrem Rechnungseingang, Kontierungen oder Trends.</p>
                <span className="text-xs text-emerald-400 mt-3 block group-hover:underline">Copilot öffnen →</span>
              </a>
              <a href="/dashboard/settings" className="group bg-[#0a0a0a]/50 border border-[#262626] rounded-xl p-5 hover:border-violet-500/30 transition">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold">3</div>
                  <span className="text-sm font-semibold">Team einladen</span>
                </div>
                <p className="text-xs text-[#737373]">Laden Sie Ihr Team ein und weisen Sie Rollen zu (Admin, Editor, Viewer).</p>
                <span className="text-xs text-violet-400 mt-3 block group-hover:underline">Team verwalten →</span>
              </a>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Willkommen, {user.name.split(" ")[0]}!</h1>
          <p className="text-[#737373] mt-1 text-sm sm:text-base">Ihr E-Rechnungs-Dashboard</p>
        </div>

        {/* Usage Banner */}
        {usage && (
          <div className="mb-6 bg-[#171717]/50 border border-[#262626] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#737373]">Rechnungen diesen Monat:</span>
              <span className="text-sm font-semibold">{usage.used} / {usage.limit==="unlimited"?"∞":usage.limit}</span>
            </div>
            {usage.limit!=="unlimited"&&(
              <div className="w-32 bg-[#262626] rounded-full h-2 hidden sm:block">
                <div className="bg-[#e85d04] h-2 rounded-full" style={{width:Math.min(100,(usage.used/usage.limit)*100)+"%"}}/>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
          {modules.map((m,i)=>(
            <a key={i} href={m.href} className={"bg-gradient-to-br "+m.color+" p-5 rounded-xl text-white hover:scale-[1.02] transition-transform"}>
              <span className="text-2xl">{m.icon}</span>
              <p className="font-semibold mt-2">{m.title}</p>
              <p className="text-xs opacity-80 mt-0.5">{m.desc}</p>
            </a>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[#737373] uppercase tracking-wider mb-3">Schnellzugriff</h2>
          <div className="flex flex-wrap gap-2">
            {[
              {href:"/dashboard/rechnungen",label:"Rechnung hochladen",icon:"⬆️"},
              {href:"/dashboard/copilot",label:"KI fragen",icon:"💬"},
              {href:"/dashboard/analytics",label:"Reports",icon:"📈"},
              {href:"/dashboard/settings",label:"Einstellungen",icon:"⚙️"},
              {href:"https://app.sbsdeutschland.com/api/erechnung/docs",label:"API Docs",icon:"📖"},
            ].map((a,i)=>(
              <a key={i} href={a.href} className="flex items-center gap-2 px-4 py-2 bg-[#171717]/50 border border-[#262626] rounded-lg text-sm text-[#d4d4d4] hover:text-white hover:border-[#404040] transition">
                <span>{a.icon}</span>{a.label}
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#171717]/50 border border-[#262626] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#d4d4d4] mb-4">Systemstatus</h3>
            <div className="space-y-3">
              {[
                {label:"E-Rechnungs API",status:"live",detail:"v1.2.0"},
                {label:"KI-Kontierung",status:"live",detail:"Gemini + Claude"},
                {label:"DATEV Export",status:"live",detail:"SKR03 nativ"},
                {label:"Email Ingestion",status:"active",detail:"5 Min Intervall"},
                {label:"GoBD Compliance",status:"live",detail:"SHA-256 Chain"},
              ].map((s,i)=>(
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-[#d4d4d4]">{s.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#525252]">{s.detail}</span>
                    <span className={"w-2 h-2 rounded-full "+(s.status==="live"?"bg-emerald-400":"bg-amber-400")}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#171717]/50 border border-[#262626] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#d4d4d4]">Aktivitäten</h3>
              <a href="/dashboard/analytics" className="text-xs text-[#e85d04] hover:text-[#f48c06]">Alle ansehen →</a>
            </div>
            <div className="text-center py-8">
              <a href="/dashboard/analytics" className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600/20 border border-violet-500/30 rounded-lg text-sm text-violet-300 hover:text-violet-200 transition">
                📊 Analytics öffnen
              </a>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/[0.06] md:hidden z-50">
        <div className="flex justify-around py-2">
          {[...modules,{href:"/dashboard/settings",icon:"⚙️",title:"Settings",desc:"",color:""}].map((m,i)=>(
            <a key={i} href={m.href} className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#737373] hover:text-white transition">
              <span className="text-lg">{m.icon}</span>
              <span className="text-[10px]">{m.title}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
