"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
const API = process.env.NEXT_PUBLIC_API_URL || "https://app.sbsdeutschland.com/api/erechnung";

export default function ExportHistoriePage() {
  const { user, token } = useAuth();
  const [exports, setExports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/export-history`, { headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": user?.tenant_id || "" }})
      .then(r => r.json()).then(d => { setExports(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, [token, user]);

  if (!user) return null;

  const datevExports = exports.filter(e => e.event_type === "datev_exported" || e.event_type === "transition_completed");
  const xrechnungExports = exports.filter(e => e.event_type === "xrechnung_generated");

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Export-Historie</h1>
        <p className="text-sm text-gray-500">{exports.length} Exporte gesamt</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Alle Exporte", value: exports.length, icon: "📦", color: "#003856" },
          { label: "DATEV", value: datevExports.length, icon: "📊", color: "#10b981" },
          { label: "XRechnung", value: xrechnungExports.length, icon: "📄", color: "#8b5cf6" },
        ].map((k,i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <span className="text-2xl">{k.icon}</span>
            <p className="text-2xl font-bold text-gray-900 mt-2">{k.value}</p>
            <p className="text-sm text-gray-500">{k.label}</p>
          </div>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><div className="flex gap-1.5">{[0,150,300].map(d=><div key={d} className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{animationDelay:`${d}ms`}}/>)}</div></div>
      ) : exports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-gray-500">Noch keine Exporte durchgeführt</p>
          <p className="text-xs text-gray-400 mt-1">Geben Sie Rechnungen frei und exportieren Sie nach DATEV oder als XRechnung</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 text-[10px] text-gray-400 uppercase tracking-widest font-medium border-b border-gray-100 bg-gray-50">
            <div className="col-span-2">Datum</div><div className="col-span-2">Typ</div><div className="col-span-3">Dokument</div><div className="col-span-2">Betrag</div><div className="col-span-3">Lieferant</div>
          </div>
          {exports.map((e, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-50 hover:bg-gray-50 transition items-center">
              <div className="col-span-2 text-xs text-gray-400 font-mono">{e.created_at ? new Date(e.created_at).toLocaleDateString("de-DE") : "—"}</div>
              <div className="col-span-2"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${e.event_type.includes("datev")?"bg-green-50 text-green-700":e.event_type.includes("xrechnung")?"bg-violet-50 text-violet-700":"bg-blue-50 text-blue-700"}`}>{e.event_type.includes("datev")?"DATEV":e.event_type.includes("xrechnung")?"XRechnung":"Export"}</span></div>
              <div className="col-span-3"><a href={`/dashboard/rechnungen/${e.document_id}`} className="text-sm text-[#003856] hover:text-[#e85d04] font-medium truncate block">{e.invoice_number || e.file_name || e.document_id?.slice(0,12)}</a></div>
              <div className="col-span-2 text-sm font-medium text-gray-900">{e.total_amount ? Number(e.total_amount).toLocaleString("de-DE",{style:"currency",currency:e.currency||"EUR"}) : "—"}</div>
              <div className="col-span-3 text-sm text-gray-500 truncate">{e.supplier || "—"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
