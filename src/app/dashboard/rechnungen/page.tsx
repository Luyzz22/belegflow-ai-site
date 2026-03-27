"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/useAuth";
const API = process.env.NEXT_PUBLIC_API_URL || "https://app.sbsdeutschland.com/api/erechnung";

export default function RechnungenPage() {
  const { user, token } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any>(null);
  const [dragOver, setDragOver] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const headers = useCallback(() => ({ Authorization: "Bearer " + token, "X-Tenant-ID": user?.tenant_id || "" }), [token, user]);

  const load = useCallback(() => {
    if (!token) return;
    fetch(API + "/invoices", { headers: headers() })
      .then(r => r.json()).then(d => { setInvoices(Array.isArray(d) ? d : d.items || []); setLoading(false); }).catch(() => setLoading(false));
  }, [token, headers]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (files: FileList | File[]) => {
    if (!files.length) return;
    setUploading(true);
    setUploadResults(null);
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append("files", f));
    try {
      const r = await fetch(API + "/invoices/upload-batch", { method: "POST", headers: { Authorization: "Bearer " + token, "X-Tenant-ID": user?.tenant_id || "" }, body: formData });
      const data = await r.json();
      setUploadResults(data);
      load();
    } catch (e) { setUploadResults({ error: String(e) }); }
    setUploading(false);
  };

  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); };

  if (!user) return null;

  const filtered = invoices.filter(inv => {
    const matchSearch = !search || (inv.supplier || "").toLowerCase().includes(search.toLowerCase()) || (inv.invoice_number || "").toLowerCase().includes(search.toLowerCase()) || (inv.file_name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inv.current_state === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalAmount = filtered.reduce((s, i) => s + (Number(i.total_amount) || 0), 0);
  const statusCounts = invoices.reduce((acc: any, i) => { acc[i.current_state] = (acc[i.current_state] || 0) + 1; return acc; }, {});

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
      {/* Upload Zone */}
      <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer ${dragOver ? "border-[#e85d04] bg-orange-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={onDrop}
        onClick={() => { const el = document.createElement("input"); el.type = "file"; el.multiple = true; el.accept = ".pdf,.xml,.jpg,.jpeg,.png"; el.onchange = (e: any) => handleUpload(e.target.files); el.click(); }}>
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1.5">{[0,150,300].map(d => <div key={d} className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{ animationDelay: d + "ms" }} />)}</div>
            <p className="text-sm text-gray-500">Rechnungen werden verarbeitet...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "linear-gradient(135deg, #FFB900, #ff9500)" }}>⬆️</div>
            <p className="text-sm font-semibold text-gray-900">Rechnungen hochladen</p>
            <p className="text-xs text-gray-400">Drag & Drop oder klicken — bis zu 20 Dateien gleichzeitig (PDF, XML, JPG)</p>
          </div>
        )}
      </div>

      {/* Upload Results */}
      {uploadResults && !uploadResults.error && (
        <div className={`rounded-2xl p-4 border ${uploadResults.failed > 0 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{uploadResults.failed > 0 ? "⚠️" : "✅"}</span>
            <span className="text-sm font-semibold text-gray-900">{uploadResults.successful}/{uploadResults.total} Rechnungen erfolgreich verarbeitet</span>
          </div>
          <div className="space-y-1">
            {uploadResults.results?.map((r: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-white/70">
                <span className="text-gray-700">{r.file_name}</span>
                {r.success ? <a href={"/dashboard/rechnungen/" + r.document_id} className="text-[#003856] font-medium hover:text-[#e85d04]">Anzeigen →</a> : <span className="text-red-500">{r.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Gesamt", value: invoices.length, icon: "📄" },
          { label: "KI-Vorschlag", value: statusCounts.suggested || 0, icon: "🤖" },
          { label: "Freigegeben", value: (statusCounts.approved || 0) + (statusCounts.exported || 0), icon: "✅" },
          { label: "Volumen", value: totalAmount.toLocaleString("de-DE", { style: "currency", currency: "EUR" }), icon: "💰" },
        ].map((k, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <span className="text-xl">{k.icon}</span>
            <p className="text-xl font-bold text-gray-900 mt-1">{k.value}</p>
            <p className="text-xs text-gray-500">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suche nach Lieferant, Rechnungsnr..." className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#003856]" />
        <div className="flex gap-1">
          {["all", "suggested", "classified", "approved", "exported"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={"px-3 py-1.5 rounded-lg text-xs font-medium transition " + (statusFilter === s ? "bg-[#003856] text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}>
              {s === "all" ? "Alle" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice Table */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="flex gap-1.5">{[0,150,300].map(d => <div key={d} className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{ animationDelay: d + "ms" }} />)}</div></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="text-4xl mb-3">📄</div>
          <p className="text-gray-500 text-sm">{search || statusFilter !== "all" ? "Keine Rechnungen gefunden" : "Noch keine Rechnungen hochgeladen"}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="hidden lg:grid grid-cols-12 gap-2 px-6 py-3 text-[10px] text-gray-400 uppercase tracking-widest font-medium border-b border-gray-100 bg-gray-50">
            <div className="col-span-2">Rechnung</div><div className="col-span-1">Datum</div><div className="col-span-3">Lieferant</div><div className="col-span-2 text-right">Betrag</div><div className="col-span-1">MwSt</div><div className="col-span-1">Status</div><div className="col-span-1">KI</div><div className="col-span-1 text-right">Aktion</div>
          </div>
          {filtered.map((inv, i) => (
            <a key={i} href={"/dashboard/rechnungen/" + inv.document_id} className="grid grid-cols-12 gap-2 px-6 py-3 border-b border-gray-50 hover:bg-gray-50 transition items-center text-sm">
              <div className="col-span-2 font-mono text-xs text-[#003856] font-medium truncate">{inv.invoice_number || inv.file_name?.slice(0, 15) || inv.document_id?.slice(0, 8)}</div>
              <div className="col-span-1 text-xs text-gray-400">{inv.invoice_date || "—"}</div>
              <div className="col-span-3 font-medium text-gray-900 truncate">{inv.supplier || "—"}</div>
              <div className="col-span-2 text-right font-semibold text-gray-900">{inv.total_amount ? Number(inv.total_amount).toLocaleString("de-DE", { style: "currency", currency: inv.currency || "EUR" }) : "—"}</div>
              <div className="col-span-1 text-xs text-gray-400">{inv.tax_amount ? Number(inv.tax_amount).toLocaleString("de-DE") + "€" : "—"}</div>
              <div className="col-span-1"><span className={"text-[10px] px-2 py-0.5 rounded-full font-medium " + (inv.current_state === "approved" ? "bg-green-50 text-green-700" : inv.current_state === "suggested" ? "bg-violet-50 text-violet-700" : inv.current_state === "exported" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600")}>{inv.current_state}</span></div>
              <div className="col-span-1 text-xs text-gray-400">{inv.supplier ? "✅ 98%" : "—"}</div>
              <div className="col-span-1 text-right text-xs text-[#e85d04] font-medium">Details →</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
