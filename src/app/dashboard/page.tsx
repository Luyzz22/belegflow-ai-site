"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const modules = [
    { href: "/dashboard/rechnungen", icon: "\ud83d\udcc4", title: "Rechnungen", desc: "Upload & Verarbeitung", color: "from-[#e85d04] to-[#f48c06]" },
    { href: "/dashboard/analytics", icon: "\ud83d\udcca", title: "Analytics", desc: "KPIs & Charts", color: "from-violet-500 to-purple-600" },
    { href: "/dashboard/copilot", icon: "\ud83e\udd16", title: "Finance Copilot", desc: "KI-Chat", color: "from-emerald-500 to-green-600" },
  ];

  const quickActions = [
    { href: "/dashboard/rechnungen", label: "Rechnung hochladen", icon: "\u2b06\ufe0f" },
    { href: "/dashboard/copilot", label: "KI fragen", icon: "\ud83d\udcac" },
    { href: "/dashboard/analytics", label: "Reports ansehen", icon: "\ud83d\udcc8" },
    { href: "https://app.sbsdeutschland.com/api/erechnung/docs", label: "API Docs", icon: "\ud83d\udcd6" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="fixed top-0 left-0 right-0 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.06] z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#e85d04] rounded-lg flex items-center justify-center font-bold text-white text-xs">BF</div>
              <span className="text-lg font-bold hidden sm:block" style={{ fontFamily: "'Instrument Serif', serif" }}>BelegFlow AI</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {modules.map((m, i) => (
              <a key={i} href={m.href} className="px-3 py-1.5 text-sm text-[#a3a3a3] hover:text-white hover:bg-[#171717] rounded-lg transition">
                {m.icon} {m.title}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#737373] hidden sm:block">{user.name}</span>
            <button onClick={logout} className="text-xs text-[#525252] hover:text-white px-2 py-1 rounded transition">Logout</button>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-24 md:pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Willkommen, {user.name.split(" ")[0]}!</h1>
          <p className="text-[#737373] mt-1 text-sm sm:text-base">Ihr E-Rechnungs-Dashboard</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
          {modules.map((m, i) => (
            <a key={i} href={m.href} className={"bg-gradient-to-br " + m.color + " p-5 rounded-xl text-white hover:scale-[1.02] transition-transform"}>
              <span className="text-2xl">{m.icon}</span>
              <p className="font-semibold mt-2">{m.title}</p>
              <p className="text-xs opacity-80 mt-0.5">{m.desc}</p>
            </a>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[#737373] uppercase tracking-wider mb-3">Schnellzugriff</h2>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((a, i) => (
              <a key={i} href={a.href}
                className="flex items-center gap-2 px-4 py-2 bg-[#171717]/50 border border-[#262626] rounded-lg text-sm text-[#d4d4d4] hover:text-white hover:border-[#404040] transition">
                <span>{a.icon}</span> {a.label}
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#171717]/50 border border-[#262626] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#d4d4d4] mb-4">Systemstatus</h3>
            <div className="space-y-3">
              {[
                { label: "E-Rechnungs API", status: "live", detail: "v1.2.0" },
                { label: "KI-Kontierung", status: "live", detail: "Gemini + Claude" },
                { label: "DATEV Export", status: "live", detail: "SKR03 nativ" },
                { label: "Email Ingestion", status: "active", detail: "5 Min Intervall" },
                { label: "GoBD Compliance", status: "live", detail: "SHA-256 Chain" },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-[#d4d4d4]">{s.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#525252]">{s.detail}</span>
                    <span className={"w-2 h-2 rounded-full " + (s.status === "live" ? "bg-emerald-400" : "bg-amber-400")} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#171717]/50 border border-[#262626] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#d4d4d4]">Aktivit\u00e4ten</h3>
              <a href="/dashboard/analytics" className="text-xs text-[#e85d04] hover:text-[#f48c06]">Alle ansehen \u2192</a>
            </div>
            <div className="text-center py-8">
              <a href="/dashboard/analytics" className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600/20 border border-violet-500/30 rounded-lg text-sm text-violet-300 hover:text-violet-200 transition">
                \ud83d\udcca Analytics \u00f6ffnen
              </a>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/[0.06] md:hidden z-50">
        <div className="flex justify-around py-2">
          {modules.map((m, i) => (
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
