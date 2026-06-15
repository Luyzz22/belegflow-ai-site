"use client";

import { useState } from "react";
import { Copy, Check, KeyRound, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import Toggle from "@/components/Toggle";
import { useToast } from "@/components/toast/ToastProvider";

const BASE = "https://erechnung.sbsdeutschland.com/api/app";
const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";

type Lang = "curl" | "python" | "javascript";

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  desc: string;
  body?: string;
}

const ENDPOINTS: Endpoint[] = [
  { method: "POST", path: "/login", desc: "Token erhalten (JWT).", body: '{"email":"...","password":"..."}' },
  { method: "GET", path: "/me", desc: "Aktuelle Benutzerinformationen." },
  { method: "POST", path: "/upload", desc: "Rechnung hochladen (multipart, Feld \"file\")." },
  { method: "GET", path: "/invoices", desc: "Liste aller Rechnungen." },
  { method: "GET", path: "/invoices/{id}", desc: "Detail einer Rechnung." },
  { method: "POST", path: "/freigaben/{id}/approve", desc: "Rechnung freigeben." },
  { method: "POST", path: "/datev/export", desc: "DATEV-Buchungsstapel als CSV exportieren." },
];

const METHOD_CLS: Record<string, string> = {
  GET: "bg-emerald-50 text-emerald-700",
  POST: "bg-blue-50 text-blue-700",
  DELETE: "bg-red-50 text-red-700",
};

function sample(ep: Endpoint, lang: Lang): string {
  const url = `${BASE}${ep.path}`;
  if (lang === "curl") {
    const lines = [`curl -X ${ep.method} ${url} \\`, `  -H "Authorization: Bearer $TOKEN"`];
    if (ep.body) lines.push(`  -H "Content-Type: application/json" \\`, `  -d '${ep.body}'`);
    return lines.join("\n");
  }
  if (lang === "python") {
    const m = ep.method.toLowerCase();
    return [
      "import requests",
      "",
      `r = requests.${m}(`,
      `    "${url}",`,
      '    headers={"Authorization": f"Bearer {token}"},',
      ep.body ? `    json=${ep.body.replace(/"/g, "'")},` : "",
      ")",
      "print(r.json())",
    ]
      .filter(Boolean)
      .join("\n");
  }
  return [
    `const res = await fetch("${url}", {`,
    `  method: "${ep.method}",`,
    '  headers: { Authorization: `Bearer ${token}` },',
    ep.body ? `  body: JSON.stringify(${ep.body}),` : "",
    "});",
    "const data = await res.json();",
  ]
    .filter(Boolean)
    .join("\n");
}

export default function EntwicklerPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [lang, setLang] = useState<Lang>("curl");
  const [copied, setCopied] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [events, setEvents] = useState<Record<string, boolean>>({
    "invoice.processed": false,
    "invoice.approved": false,
    "export.completed": false,
  });

  const apiKey = "flck_live_" + "••••••••••••" + String(user?.id ?? "0").padStart(3, "0");

  const copy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(id);
        setTimeout(() => setCopied(null), 1500);
      },
      () => addToast({ type: "error", text: "Kopieren fehlgeschlagen" })
    );
  };

  return (
    <div className="fc-fade-in">
      <PageHeader title="Entwickler" description="FlowCheck API — Dokumentation & Integrationen" />

      {/* Übersicht */}
      <div className={`${CARD} mb-6`}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-lg bg-[#003856]/5 px-2.5 py-1 text-xs font-semibold text-[#003856]">FlowCheck API v1</span>
          <span className="text-sm text-[#64748b]">Auth: Bearer Token (JWT)</span>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-[rgba(0,56,86,0.12)] bg-[#faf9f7] px-3 py-2.5">
          <span className="text-xs font-medium uppercase tracking-wider text-[#64748b]">Base URL</span>
          <code className="flex-1 truncate font-mono text-xs text-[#1a1a2e]">{BASE}</code>
          <button onClick={() => copy(BASE, "base")} className="rounded-lg p-1.5 text-[#003856] transition hover:bg-[#003856]/5" aria-label="Kopieren">
            {copied === "base" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Sprach-Tabs */}
      <div className="mb-4 flex gap-1">
        {(["curl", "python", "javascript"] as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium transition ${
              lang === l ? "bg-[#0f1117] text-white" : "bg-white text-[#64748b] ring-1 ring-[rgba(0,56,86,0.08)] hover:text-[#003856]"
            }`}
          >
            {l === "curl" ? "curl" : l === "python" ? "Python" : "JavaScript"}
          </button>
        ))}
      </div>

      {/* Endpoints */}
      <div className="space-y-4">
        {ENDPOINTS.map((ep) => {
          const code = sample(ep, lang);
          const id = `${ep.method}-${ep.path}`;
          return (
            <div key={id} className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[rgba(0,56,86,0.08)] lg:grid-cols-2">
              <div className="bg-white p-5">
                <div className="flex items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${METHOD_CLS[ep.method]}`}>{ep.method}</span>
                  <code className="font-mono text-sm text-[#1a1a2e]">{ep.path}</code>
                </div>
                <p className="mt-2 text-sm text-[#64748b]">{ep.desc}</p>
              </div>
              <div className="relative bg-[#0f1117] p-5">
                <button
                  onClick={() => copy(code, id)}
                  className="absolute right-3 top-3 rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
                  aria-label="Code kopieren"
                >
                  {copied === id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
                <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-[#e4e4e7]">{code}</pre>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* API-Schlüssel */}
        <div className={CARD}>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-[#1a1a2e]">
            <KeyRound className="h-5 w-5 text-[#003856]" /> API-Schlüssel
          </h2>
          <div className="flex items-center gap-2 rounded-xl border border-[rgba(0,56,86,0.12)] bg-[#faf9f7] px-3 py-2.5">
            <code className="flex-1 truncate font-mono text-xs text-[#1a1a2e]">{apiKey}</code>
            <button onClick={() => copy(apiKey, "key")} className="rounded-lg p-1.5 text-[#003856] transition hover:bg-[#003856]/5" aria-label="Kopieren">
              {copied === "key" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <button
            onClick={() => addToast({ type: "info", text: "Token-Rotation ist noch nicht verfügbar." })}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2 text-sm font-medium text-[#003856] transition hover:bg-[#faf9f7] active:scale-95"
          >
            <RefreshCw className="h-4 w-4" /> Neuen Token generieren
          </button>
        </div>

        {/* Rate Limits */}
        <div className={CARD}>
          <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Rate Limits</h2>
          <p className="text-sm text-[#64748b]">100 Requests/Minute · 1.000 Requests/Stunde</p>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-[#64748b]">
              <span>Aktuell (diese Minute)</span>
              <span>23 / 100</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#003856]/5">
              <div className="h-full rounded-full bg-[#003856]" style={{ width: "23%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Webhooks */}
      <div className={`${CARD} mt-6`}>
        <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Webhooks</h2>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#64748b]">Webhook-URL</label>
        <input
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="https://ihre-app.de/webhooks/flowcheck"
          className="w-full rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
        />
        <div className="mt-4 space-y-1">
          {Object.keys(events).map((ev) => (
            <label key={ev} className="flex items-center justify-between gap-4 border-b border-[rgba(0,56,86,0.06)] py-2.5 last:border-0">
              <code className="text-sm text-[#1a1a2e]">{ev}</code>
              <Toggle checked={events[ev]} onChange={(v) => setEvents((p) => ({ ...p, [ev]: v }))} label={ev} />
            </label>
          ))}
        </div>
        <button
          onClick={() => addToast({ type: "success", text: "Webhook-Konfiguration gespeichert (UI-Demo)." })}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95"
        >
          Speichern
        </button>
      </div>
    </div>
  );
}
