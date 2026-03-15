"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const API = "https://app.sbsdeutschland.com/api/erechnung";

export default function StatusPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState("");

  const check = async () => {
    setLoading(true);
    try {
      const r = await fetch(API + "/health");
      if (r.ok) setHealth(await r.json());
      else setHealth({ status: "error", checks: {} });
    } catch { setHealth({ status: "unreachable", checks: {} }); }
    finally { setLoading(false); setLastCheck(new Date().toLocaleTimeString("de-DE")); }
  };

  useEffect(() => { check(); const i = setInterval(check, 30000); return () => clearInterval(i); }, []);

  const ok = health?.status === "healthy";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d4d4d4]">
      <nav className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-[72px] flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e85d04] rounded-lg flex items-center justify-center font-bold text-white text-xs">BF</div>
            <span className="text-lg font-bold text-white" style={{fontFamily:"'Instrument Serif',serif"}}>BelegFlow AI</span>
          </Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className={"inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 " + (ok ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30")}>
            <span className={"w-2.5 h-2.5 rounded-full " + (ok ? "bg-emerald-400 animate-pulse" : "bg-red-400")} />
            {loading ? "Wird geprüft..." : ok ? "Alle Systeme operativ" : "Störung erkannt"}
          </div>
          <h1 className="text-4xl font-bold text-white mb-2" style={{fontFamily:"'Instrument Serif',serif"}}>Systemstatus</h1>
          <p className="text-[#737373] text-sm">Letzte Prüfung: {lastCheck || "..."} · Auto-Refresh: 30s</p>
        </div>

        {health && (
          <div className="space-y-3 mb-8">
            {[
              { name: "API Server", status: health.checks?.api || "unknown", detail: "v" + (health.version || "?") },
              { name: "Datenbank (PostgreSQL)", status: health.checks?.database || "unknown", detail: "Frankfurt" },
              { name: "KI-Engine", status: ok ? "ok" : "unknown", detail: "Gemini + Claude" },
              { name: "DATEV Export", status: ok ? "ok" : "unknown", detail: "SKR03 nativ" },
              { name: "Email (Resend)", status: ok ? "ok" : "unknown", detail: "Transaktional" },
              { name: "Frontend (Vercel)", status: "ok", detail: "Edge Network" },
            ].map((s, i) => (
              <div key={i} className="bg-[#171717]/50 border border-[#262626] rounded-xl px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={"w-2.5 h-2.5 rounded-full shrink-0 " + (s.status === "ok" ? "bg-emerald-400" : s.status === "unknown" ? "bg-amber-400" : "bg-red-400")} />
                  <span className="text-sm font-medium text-white">{s.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#525252]">{s.detail}</span>
                  <span className={"text-xs px-2 py-0.5 rounded-full " + (s.status === "ok" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400")}>
                    {s.status === "ok" ? "Operativ" : "Prüfung"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <button onClick={check} disabled={loading} className="px-6 py-2.5 bg-[#171717] border border-[#262626] rounded-xl text-sm text-[#a3a3a3] hover:text-white hover:border-[#404040] disabled:opacity-50 transition">
            {loading ? "Prüfe..." : "Jetzt prüfen"}
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.06] text-center">
          <p className="text-xs text-[#525252] mb-4">Bei Störungen kontaktieren Sie uns: <a href="mailto:ki@sbsdeutschland.de" className="text-[#e85d04]">ki@sbsdeutschland.de</a></p>
          <Link href="/" className="text-sm text-[#e85d04] hover:text-[#f48c06]">← Zurück zur Startseite</Link>
        </div>
      </div>
    </div>
  );
}
