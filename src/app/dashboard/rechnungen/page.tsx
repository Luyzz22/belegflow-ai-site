"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/useAuth";

const API = "https://app.sbsdeutschland.com/api/erechnung";

const STATUS: Record<string,{label:string,color:string}> = {
  uploaded:{label:"Hochgeladen",color:"bg-blue-500/20 text-blue-400"},
  classified:{label:"Klassifiziert",color:"bg-cyan-500/20 text-cyan-400"},
  validated:{label:"Validiert",color:"bg-teal-500/20 text-teal-400"},
  suggested:{label:"KI-Vorschlag",color:"bg-violet-500/20 text-violet-400"},
  approved:{label:"Freigegeben",color:"bg-emerald-500/20 text-emerald-400"},
  exported:{label:"Exportiert",color:"bg-green-500/20 text-green-400"},
  archived:{label:"Archiviert",color:"bg-gray-500/20 text-gray-400"},
  rejected:{label:"Abgelehnt",color:"bg-red-500/20 text-red-400"},
  error:{label:"Fehler",color:"bg-red-500/20 text-red-400"},
};

interface Invoice {
  document_id: string;
  file_name: string;
  current_state: string;
  created_at: string;
  supplier?: string;
  total_amount?: number;
  currency?: string;
}

export default function RechnungenPage() {
  const { user, token } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await fetch(API + "/invoices", {
        headers: { "X-Tenant-ID": user?.tenant_id || "", Authorization: "Bearer " + token },
      });
      if (r.ok) {
        const d = await r.json();
        setInvoices(Array.isArray(d) ? d : d.invoices || []);
      }
    } catch {} finally { setLoading(false); }
  }, [token, user]);

  useEffect(() => { load(); }, [load]);

  const upload = async (file: File) => {
    setUploading(true); setMsg("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await fetch(API + "/invoices/upload", {
        method: "POST",
        headers: { "X-Tenant-ID": user?.tenant_id || "", Authorization: "Bearer " + token },
        body: fd,
      });
      if (r.ok) {
        const d = await r.json();
        setMsg("Rechnung hochgeladen: " + d.document_id);
        load();
      } else {
        const d = await r.json();
        setMsg("Fehler: " + (d.detail || r.status));
      }
    } catch { setMsg("Verbindungsfehler"); } finally { setUploading(false); }
  };

  const exportDatev = async (docId: string) => {
    try {
      const r = await fetch(API + "/invoices/" + docId + "/datev-export", {
        headers: { "X-Tenant-ID": user?.tenant_id || "", Authorization: "Bearer " + token },
      });
      if (r.ok) {
        const d = await r.json();
        setMsg("DATEV Export: " + (d.file_name || "OK"));
      } else { setMsg("Export-Fehler"); }
    } catch { setMsg("Verbindungsfehler"); }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-[#737373] hover:text-white transition">&larr; Dashboard</a>
            <div className="h-6 w-px bg-[#262626]" />
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e85d04] to-[#f48c06] flex items-center justify-center text-lg">📄</div>
              <div><h1 className="text-lg font-semibold">Rechnungen</h1><p className="text-xs text-[#737373]">{invoices.length} Belege</p></div>
            </div>
          </div>
          <label className={"inline-flex items-center gap-2 px-5 py-2.5 bg-[#e85d04] hover:bg-[#f48c06] rounded-xl text-sm font-medium cursor-pointer transition " + (uploading ? "opacity-50 pointer-events-none" : "")}>
            <span>{uploading ? "Wird hochgeladen..." : "⬆️ Hochladen"}</span>
            <input type="file" accept=".pdf,.xml,.png,.jpg,.jpeg" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
          </label>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {msg && (
          <div className={"mb-6 rounded-xl px-4 py-3 text-sm " + (msg.startsWith("Fehler") ? "bg-red-500/10 text-red-400 border border-red-500/30" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30")}>
            {msg}
            <button onClick={() => setMsg("")} className="float-right text-xs opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📄</div>
            <h2 className="text-xl font-semibold mb-2">Keine Rechnungen</h2>
            <p className="text-[#737373] text-sm mb-6">Laden Sie Ihre erste Rechnung hoch — PDF, XML oder XRechnung.</p>
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-[#e85d04] hover:bg-[#f48c06] rounded-xl text-sm font-medium cursor-pointer transition">
              <span>Erste Rechnung hochladen</span>
              <input type="file" accept=".pdf,.xml,.png,.jpg,.jpeg" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
            </label>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-xs text-[#525252] uppercase tracking-wider font-medium">
              <div className="col-span-4">Datei</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Lieferant</div>
              <div className="col-span-2 text-right">Betrag</div>
              <div className="col-span-2 text-right">Aktionen</div>
            </div>

            {invoices.map((inv, i) => {
              const s = STATUS[inv.current_state] || { label: inv.current_state, color: "bg-[#262626] text-[#737373]" };
              return (
                <div key={i} className="bg-[#171717]/50 border border-[#262626] rounded-xl px-4 py-3 hover:border-[#404040] transition grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
                  <div className="col-span-4">
                    <p className="text-sm font-medium text-white truncate">{inv.file_name || inv.document_id}</p>
                    <p className="text-xs text-[#525252] mt-0.5">{new Date(inv.created_at).toLocaleDateString("de-DE")} · {inv.document_id.slice(0, 8)}</p>
                  </div>
                  <div className="col-span-2">
                    <span className={"text-xs px-2.5 py-1 rounded-full font-medium " + s.color}>{s.label}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-[#a3a3a3]">{inv.supplier || "—"}</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-sm font-medium">
                      {inv.total_amount ? new Intl.NumberFormat("de-DE", { style: "currency", currency: inv.currency || "EUR" }).format(inv.total_amount) : "—"}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    {["approved", "exported"].includes(inv.current_state) && (
                      <button onClick={() => exportDatev(inv.document_id)}
                        className="text-xs px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition">
                        DATEV
                      </button>
                    )}
                    <a href={`https://app.sbsdeutschland.com/api/erechnung/invoices/${inv.document_id}`}
                      target="_blank" rel="noopener"
                      className="text-xs px-3 py-1.5 bg-[#262626] text-[#a3a3a3] rounded-lg hover:text-white transition">
                      Details
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
