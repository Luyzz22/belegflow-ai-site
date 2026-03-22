"use client";

export function DuplicateAlert({ duplicates }: { duplicates: any[] }) {
  if (!duplicates || duplicates.length === 0) return null;
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">⚠️</span>
        <h3 className="text-sm font-bold text-amber-800">Mögliche Duplikate erkannt ({duplicates.length})</h3>
      </div>
      <div className="space-y-2">
        {duplicates.map((d, i) => (
          <div key={i} className="flex items-center justify-between bg-white rounded-xl p-3 border border-amber-100">
            <div>
              <p className="text-sm font-medium text-gray-900">{d.supplier || "Unbekannt"}</p>
              <p className="text-xs text-gray-500">
                {d.invoice_number} · {d.total_amount ? `${Number(d.total_amount).toLocaleString("de-DE")}€` : ""} · {d.invoice_date}
              </p>
              <p className="text-[10px] text-amber-600 mt-0.5">{d.reasons?.join(" · ")}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${d.confidence >= 0.9 ? "bg-red-100 text-red-700" : d.confidence >= 0.7 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                {Math.round(d.confidence * 100)}%
              </span>
              <a href={`/dashboard/rechnungen/${d.document_id}`} className="text-xs text-[#003856] hover:text-[#e85d04] font-medium">Anzeigen →</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnomalyAlert({ anomalies }: { anomalies: any[] }) {
  if (!anomalies || anomalies.length === 0) return null;
  const severityColors: Record<string, string> = {
    critical: "bg-red-50 border-red-200 text-red-800",
    high: "bg-orange-50 border-orange-200 text-orange-800",
    medium: "bg-amber-50 border-amber-200 text-amber-800",
    low: "bg-blue-50 border-blue-200 text-blue-800",
  };
  const severityIcons: Record<string, string> = {
    critical: "🚨", high: "⚠️", medium: "🔍", low: "💡",
  };
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🔍</span>
        <h3 className="text-sm font-bold text-orange-800">Anomalien erkannt ({anomalies.length})</h3>
      </div>
      <div className="space-y-2">
        {anomalies.map((a, i) => (
          <div key={i} className={`flex items-center gap-3 rounded-xl p-3 border ${severityColors[a.severity] || severityColors.low}`}>
            <span className="text-lg">{severityIcons[a.severity] || "💡"}</span>
            <div>
              <p className="text-sm font-medium">{a.description}</p>
              <p className="text-[10px] opacity-70">{a.type.replace(/_/g, " ")} · {a.severity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExportButtons({ documentId, token, tenantId }: { documentId: string; token: string; tenantId: string }) {
  const API = process.env.NEXT_PUBLIC_API_URL || "https://app.sbsdeutschland.com/api/erechnung";
  const headers = { Authorization: `Bearer ${token}`, "X-Tenant-ID": tenantId };

  const download = async (url: string, filename: string) => {
    const res = await fetch(`${API}${url}`, { headers, method: url.includes("generate") ? "POST" : "GET" });
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">📥 Export</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button onClick={() => download(`/invoices/${documentId}/generate-xrechnung`, `xrechnung-${documentId.slice(0,8)}.xml`)}
          className="px-3 py-2.5 rounded-xl text-xs font-medium text-white transition hover:opacity-90" style={{ background: "#8b5cf6" }}>
          📄 XRechnung
        </button>
        <button onClick={() => download(`/invoices/${documentId}/generate-zugferd`, `zugferd-${documentId.slice(0,8)}.xml`)}
          className="px-3 py-2.5 rounded-xl text-xs font-medium text-white transition hover:opacity-90" style={{ background: "#f59e0b" }}>
          📦 ZUGFeRD
        </button>
        <button onClick={() => download(`/invoices/${documentId}/file`, `rechnung-${documentId.slice(0,8)}.pdf`)}
          className="px-3 py-2.5 rounded-xl text-xs font-medium text-white transition hover:opacity-90" style={{ background: "#003856" }}>
          📎 Original PDF
        </button>
        <button onClick={() => download(`/invoices/${documentId}/validate-xrechnung`, `validation-${documentId.slice(0,8)}.json`)}
          className="px-3 py-2.5 rounded-xl text-xs font-medium text-white transition hover:opacity-90" style={{ background: "#10b981" }}>
          ✅ KoSIT Check
        </button>
      </div>
    </div>
  );
}
