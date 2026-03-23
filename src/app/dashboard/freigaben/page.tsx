"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/useAuth";
import RoleGate from "@/components/RoleGate";

const API = process.env.NEXT_PUBLIC_API_URL || "https://app.sbsdeutschland.com/api/erechnung";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  suggested: { label: "KI-Vorschlag", cls: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
  validated: { label: "Validiert", cls: "bg-sky-500/15 text-sky-400 border-sky-500/20" },
  classified: { label: "Klassifiziert", cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  approved: { label: "Freigegeben", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  rejected: { label: "Abgelehnt", cls: "bg-red-500/15 text-red-400 border-red-500/20" },
  exported: { label: "Exportiert", cls: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
};

const RULES = [
  { range: "€0 — €100", auto: true, role: "editor", desc: "Automatische Freigabe" },
  { range: "€100 — €500", auto: false, role: "editor", desc: "Editor kann freigeben" },
  { range: "€500 — €5.000", auto: false, role: "admin", desc: "Admin-Freigabe erforderlich" },
  { range: "Über €5.000", auto: false, role: "admin", desc: "Vier-Augen-Prinzip" },
];

const ROLES: Record<string, { label: string; cls: string; perm: string }> = {
  viewer: { label: "Viewer", cls: "bg-[#262626] text-gray-500", perm: "Nur Ansicht" },
  editor: { label: "Editor", cls: "bg-blue-500/15 text-blue-400", perm: "Freigabe bis €500" },
  admin: { label: "Admin", cls: "bg-[#e85d04]/15 text-[#f48c06]", perm: "Unbegrenzt" },
};

export default function FreigabenPage() {
  const { user, token } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [tab, setTab] = useState<"pending" | "history" | "rules">("pending");
  const [msg, setMsg] = useState("");

  const fetchInvoices = useCallback(() => {
    if (!token) return;
    fetch(`${API}/invoices`, { headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": user?.tenant_id || "" }})
      .then(r => r.json()).then(d => { setInvoices(Array.isArray(d) ? d : d.items || []); setLoading(false); }).catch(() => setLoading(false));
  }, [token, user]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const transition = async (docId: string, toState: string) => {
    setActionId(docId);
    setMsg("");
    try {
      const res = await fetch(`${API}/invoices/${docId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "X-Tenant-ID": user?.tenant_id || "" },
        body: JSON.stringify({ to_state: toState, actor: user?.name || "User" }),
      });
      if (!res.ok) {
        setMsg("Freigabestatus konnte nicht aktualisiert werden.");
      }
      fetchInvoices();
    } catch {
      setMsg("Freigabestatus konnte nicht aktualisiert werden.");
    }
    setActionId(null);
  };

  if (!user) return null;
  const pending = invoices.filter(i => ["suggested", "validated", "classified"].includes(i.current_state || i.status));
  const completed = invoices.filter(i => ["approved", "rejected", "exported"].includes(i.current_state || i.status));
  const tabs = [{ key: "pending", label: "Ausstehend", count: pending.length }, { key: "history", label: "Erledigt", count: completed.length }, { key: "rules", label: "Regeln" }] as const;

  return (
    <RoleGate user={user} allowedRoles={["admin", "editor"]} areaLabel="Freigaben">
    <div className="">
      <div className="border-b border-gray-200 bg-[#f4f7fa]/80  sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-gray-500 hover:text-gray-900 transition text-sm">← Dashboard</a>
            <div className="h-5 w-px bg-[#262626]" />
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-base">✅</div>
              <div><h1 className="text-base font-semibold leading-tight">Freigaben</h1><p className="text-[11px] text-gray-400">{pending.length} ausstehend</p></div>
            </div>
          </div>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
            {tabs.map(t => (<button key={t.key} onClick={() => setTab(t.key as any)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${tab === t.key ? "bg-[#e85d04] text-gray-900" : "text-gray-500 hover:text-gray-900"}`}>{t.label}{"count" in t && typeof t.count === "number" && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-white/20" : "bg-[#262626]"}`}>{t.count}</span>}</button>))}
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700">
          Transparenzhinweis: KI-Vorschläge sind prüf- und korrigierbar. Freigabestatus und Aktionen werden als Audit-Ereignisse nachverfolgbar verarbeitet.
        </div>
        {msg && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{msg}</div>}
        {loading ? (<div className="flex justify-center py-20"><div className="flex gap-1.5">{[0, 150, 300].map(d => (<div key={d} className="w-2.5 h-2.5 bg-[#e85d04] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />))}</div></div>) : (<>
          {tab === "pending" && (<>{pending.length === 0 ? (<div className="bg-white border border-gray-200 rounded-xl p-12 text-center"><div className="text-4xl mb-3">✅</div><p className="text-gray-600 font-medium">Alles freigegeben</p></div>) : (<div className="space-y-2">{pending.map(inv => { const status = STATUS_MAP[inv.current_state || inv.status] || STATUS_MAP.classified; return (<div key={inv.document_id} className={`bg-white border border-gray-200 rounded-2xl px-5 shadow-sm py-4 flex items-center gap-4 ${actionId === inv.document_id ? "opacity-50" : "hover:border-gray-300"}`}><div className="flex-1 min-w-0"><a href={`/dashboard/rechnungen/${inv.document_id}`} className="text-sm font-medium text-gray-900 hover:text-[#e85d04] transition truncate block">{inv.supplier || inv.file_name || inv.document_id.slice(0, 12)}</a><div className="flex items-center gap-3 mt-1.5 flex-wrap"><span className="text-[11px] text-gray-300">{inv.file_name}</span>{inv.total_amount && <span className="text-sm font-semibold">{Number(inv.total_amount).toLocaleString("de-DE", { style: "currency", currency: inv.currency || "EUR" })}</span>}<span className={`text-[10px] px-2 py-0.5 rounded-full border ${status.cls}`}>{status.label}</span></div></div><div className="flex items-center gap-2 shrink-0"><button onClick={() => transition(inv.document_id, "approved")} disabled={actionId === inv.document_id} className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition">Freigeben</button><button onClick={() => transition(inv.document_id, "rejected")} disabled={actionId === inv.document_id} className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/25 rounded-lg text-xs font-medium hover:bg-red-500/20 transition">Ablehnen</button></div></div>); })}</div>)}</>)}
          {tab === "history" && (<>{completed.length === 0 ? (<div className="bg-white border border-gray-200 rounded-xl p-12 text-center"><p className="text-gray-400 text-sm">Keine erledigten Freigaben</p></div>) : (<div className="space-y-2">{completed.map(inv => { const status = STATUS_MAP[inv.current_state || inv.status] || STATUS_MAP.approved; return (<div key={inv.document_id} className="bg-white border border-gray-200 rounded-2xl px-5 shadow-sm py-3 flex items-center gap-4"><div className="flex-1 min-w-0"><a href={`/dashboard/rechnungen/${inv.document_id}`} className="text-sm text-gray-600 hover:text-gray-900 transition truncate block">{inv.supplier || inv.file_name}</a>{inv.total_amount && <span className="text-xs text-gray-500">{Number(inv.total_amount).toLocaleString("de-DE", { style: "currency", currency: inv.currency || "EUR" })}</span>}</div><span className={`text-[10px] px-2 py-0.5 rounded-full border ${status.cls}`}>{status.label}</span></div>); })}</div>)}</>)}
          {tab === "rules" && (<div className="space-y-8"><div><h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Freigabe-Regeln</h2><div className="space-y-2">{RULES.map((r, i) => (<div key={i} className={`bg-white border rounded-2xl px-5 shadow-sm py-4 flex items-center justify-between ${r.auto ? "border-emerald-500/20" : "border-gray-200"}`}><div className="flex items-center gap-5"><span className="text-sm font-mono text-gray-700 w-36">{r.range}</span><span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${ROLES[r.role].cls}`}>{ROLES[r.role].label}</span>{r.auto && <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">Auto</span>}</div><span className="text-[11px] text-gray-300 hidden sm:block">{r.desc}</span></div>))}</div></div><div><h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Rollen</h2><div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{Object.entries(ROLES).map(([key, r]) => (<div key={key} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"><span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${r.cls}`}>{r.label}</span><p className="text-sm text-gray-700 mt-3">{r.perm}</p></div>))}</div></div></div>)}
        </>)}
      </div>
    </div>
    </RoleGate>
  );
}
