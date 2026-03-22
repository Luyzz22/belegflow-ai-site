"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
const API = process.env.NEXT_PUBLIC_API_URL || "https://app.sbsdeutschland.com/api/erechnung";

export default function ExportePage() {
  const { user, token } = useAuth();
  const [exports, setExports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = () => ({ Authorization: `Bearer ${token}`, "X-Tenant-ID": user?.tenant_id || "" });

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/export-history`, { headers: headers() })
      .then(r => r.json()).then(d => { setExports(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, [token, user]);

  const downloadFile = async (url: string, filename: string) => {
    const res = await fetch(`${API}${url}`, { headers: headers() });
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  if (!user) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Exporte</h1>
        <p className="text-sm text-gray-500">Dateien herunterladen & Export-Historie</p>
      </div>

      {/* Download Buttons */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">📥 Dateien herunterladen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={() => downloadFile("/export/excel", "rechnungen-export.xlsx")}
            className="flex items-center justify-center gap-2 px-5 py-4 rounded-xl font-medium text-sm text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
            📊 Excel (.xlsx)
          </button>
          <button onClick={() => downloadFile("/export/csv", "rechnungen-export.csv")}
            className="flex items-center justify-center gap-2 px-5 py-4 rounded-xl font-medium text-sm text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)" }}>
            📄 CSV
          </button>
          <button onClick={() => downloadFile("/export/datev", "datev-export.csv")}
            className="flex items-center justify-center gap-2 px-5 py-4 rounded-xl font-medium text-sm text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #e85d04, #dc2626)" }}>
            🏛️ DATEV
          </button>
        </div>
      </div>

      {/* Erweiterte Exports */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">🔧 Erweiterte Exports</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "XRechnung (XML)", icon: "📄", desc: "EN 16931", color: "#8b5cf6" },
            { label: "ZUGFeRD (XML)", icon: "📦", desc: "Factur-X", color: "#f59e0b" },
          ].map((e, i) => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <span className="text-2xl">{e.icon}</span>
              <p className="text-sm font-medium text-gray-900 mt-2">{e.label}</p>
              <p className="text-[10px] text-gray-400">{e.desc}</p>
              <p className="text-[10px] text-gray-400 mt-1">Per Rechnung verfügbar</p>
            </div>
          ))}
        </div>
      </div>

      {/* Export-Historie */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">📋 Export-Historie</h2>
        {loading ? (
          <div className="flex justify-center py-12"><div className="flex gap-1.5">{[0,150,300].map(d=><div key={d} className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{animationDelay:`${d}ms`}}/>)}</div></div>
        ) : exports.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Noch keine Exporte durchgeführt</p>
        ) : (
          <div className="space-y-2">
            {exports.map((e, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{e.event_type?.includes("datev")?"📊":e.event_type?.includes("xrechnung")?"📄":"📦"}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{e.supplier || e.invoice_number || "Export"}</p>
                    <p className="text-[11px] text-gray-400">{e.created_at ? new Date(e.created_at).toLocaleString("de-DE") : ""}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${e.event_type?.includes("datev")?"bg-green-50 text-green-700":"bg-violet-50 text-violet-700"}`}>
                  {e.event_type?.includes("datev")?"DATEV":e.event_type?.includes("xrechnung")?"XRechnung":"Export"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
