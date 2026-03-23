import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "API Dokumentation" };

const endpoints = [
  { method: "POST", path: "/users/register", desc: "Neuen Account erstellen (Auto-Tenant)", auth: "Keine" },
  { method: "POST", path: "/users/login", desc: "JWT Token erhalten", auth: "Keine" },
  { method: "GET", path: "/users/profile", desc: "Eigenes Profil abrufen", auth: "Bearer Token" },
  { method: "GET", path: "/users/team", desc: "Team-Mitglieder auflisten", auth: "Bearer Token" },
  { method: "POST", path: "/users/invite", desc: "Team-Mitglied einladen (Admin)", auth: "Bearer Token" },
  { method: "PUT", path: "/users/role", desc: "Rolle ändern (Admin)", auth: "Bearer Token" },
  { method: "POST", path: "/invoices/upload", desc: "Rechnung hochladen (PDF/XML/Bild)", auth: "Bearer Token" },
  { method: "GET", path: "/invoices", desc: "Alle Rechnungen auflisten", auth: "Bearer Token" },
  { method: "GET", path: "/invoices/{id}", desc: "Rechnung im Detail", auth: "Bearer Token" },
  { method: "POST", path: "/invoices/{id}/transition", desc: "Status-Übergang auslösen", auth: "Bearer Token" },
  { method: "GET", path: "/invoices/{id}/kontierung", desc: "KI-Kontierung abrufen", auth: "Bearer Token" },
  { method: "GET", path: "/invoices/{id}/datev-export", desc: "DATEV-Export generieren", auth: "Bearer Token" },
  { method: "GET", path: "/invoices/{id}/events", desc: "Event-Timeline abrufen", auth: "Bearer Token" },
  { method: "GET", path: "/invoices/{id}/evidence", desc: "GoBD-Evidence abrufen", auth: "Bearer Token" },
  { method: "POST", path: "/copilot/chat", desc: "KI Finance Copilot befragen", auth: "Bearer Token" },
  { method: "GET", path: "/analytics/dashboard", desc: "Dashboard KPIs & Charts", auth: "Bearer Token" },
  { method: "GET", path: "/billing/plans", desc: "Verfügbare Pläne", auth: "Keine" },
  { method: "GET", path: "/billing/usage", desc: "Aktuelle Nutzung", auth: "Bearer Token" },
  { method: "GET", path: "/health", desc: "API Health Check", auth: "Keine" },
];

const MC: Record<string,string> = { GET: "bg-emerald-500/20 text-emerald-400", POST: "bg-blue-500/20 text-blue-400", PUT: "bg-amber-500/20 text-amber-400", DELETE: "bg-red-500/20 text-red-400" };

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d4d4d4]">
      <nav className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e85d04] rounded-lg flex items-center justify-center font-bold text-white text-xs">BF</div>
            <span className="text-lg font-bold text-white" style={{fontFamily:"'Instrument Serif',serif"}}>BelegFlow AI</span>
          </Link>
          <a href="https://app.sbsdeutschland.com/api/erechnung/docs" target="_blank" rel="noopener" className="px-4 py-2 bg-[#171717] border border-[#262626] rounded-lg text-sm text-[#a3a3a3] hover:text-white transition">Swagger UI →</a>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3" style={{fontFamily:"'Instrument Serif',serif"}}>API Dokumentation</h1>
          <p className="text-[#a3a3a3] mb-6">RESTful API für die Integration in Ihre bestehenden Systeme. Base URL: <code className="px-2 py-0.5 bg-[#171717] rounded text-[#e85d04] text-sm">https://app.sbsdeutschland.com/api/erechnung</code></p>
          <div className="flex flex-wrap gap-2 mb-6">
            <a href="https://app.sbsdeutschland.com/api/erechnung/docs" target="_blank" rel="noopener" className="px-3 py-1.5 text-xs bg-[#171717] border border-[#262626] rounded-lg text-[#a3a3a3] hover:text-white transition">Swagger UI</a>
            <a href="https://app.sbsdeutschland.com/api/erechnung/openapi.json" target="_blank" rel="noopener" className="px-3 py-1.5 text-xs bg-[#171717] border border-[#262626] rounded-lg text-[#a3a3a3] hover:text-white transition">OpenAPI JSON</a>
            <Link href="/demo" className="px-3 py-1.5 text-xs bg-[#171717] border border-[#262626] rounded-lg text-[#a3a3a3] hover:text-white transition">Technische Rückfrage</Link>
          </div>
          <div className="bg-[#171717]/50 border border-[#262626] rounded-xl p-5 mb-8">
            <h2 className="text-sm font-semibold text-white mb-3">Authentifizierung</h2>
            <p className="text-sm text-[#737373] mb-3">Alle geschützten Endpoints erfordern einen JWT Bearer Token im Authorization Header:</p>
            <code className="block bg-[#0f0f0f] rounded-lg p-3 text-sm text-[#a3a3a3] overflow-x-auto">Authorization: Bearer eyJhbGciOiJIUzI1NiIs...</code>
            <p className="text-xs text-[#525252] mt-3">Token erhalten Sie über POST /users/login. Token sind 24h gültig, Refresh-Tokens 30 Tage.</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-xs text-[#525252] uppercase tracking-wider font-medium">
            <div className="col-span-1">Method</div><div className="col-span-4">Endpoint</div><div className="col-span-5">Beschreibung</div><div className="col-span-2">Auth</div>
          </div>
          {endpoints.map((ep, i) => (
            <div key={i} className="bg-[#171717]/50 border border-[#262626] rounded-xl px-4 py-3 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center hover:border-[#404040] transition">
              <div className="col-span-1"><span className={"text-xs px-2 py-1 rounded font-mono font-medium " + (MC[ep.method] || "")}>{ep.method}</span></div>
              <div className="col-span-4"><code className="text-sm text-[#e85d04] font-mono">{ep.path}</code></div>
              <div className="col-span-5"><span className="text-sm text-[#a3a3a3]">{ep.desc}</span></div>
              <div className="col-span-2"><span className="text-xs text-[#525252]">{ep.auth}</span></div>
            </div>
          ))}
        </div>
        <div className="mt-12 bg-gradient-to-r from-[#e85d04]/10 to-[#171717] border border-[#e85d04]/20 rounded-xl p-6 text-center">
          <p className="text-sm text-[#a3a3a3] mb-3">Vollständige interaktive API-Dokumentation mit Swagger UI</p>
          <a href="https://app.sbsdeutschland.com/api/erechnung/docs" target="_blank" rel="noopener" className="inline-flex px-6 py-2.5 bg-[#e85d04] rounded-xl text-sm font-medium text-white hover:bg-[#f48c06] transition">Swagger UI öffnen →</a>
        </div>
        <div className="mt-8 pt-8 border-t border-white/[0.06]">
          <Link href="/" className="text-sm text-[#e85d04] hover:text-[#f48c06]">← Zurück zur Startseite</Link>
        </div>
      </div>
    </div>
  );
}
