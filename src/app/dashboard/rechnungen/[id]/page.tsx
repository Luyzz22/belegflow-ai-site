"use client";
import { DuplicateAlert, AnomalyAlert, ExportButtons } from "@/components/InvoiceAlerts";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

const API = "https://app.sbsdeutschland.com/api/erechnung";

const STATUS: Record<string,{label:string,color:string}> = {
  uploaded:{label:"Hochgeladen",color:"bg-blue-500/20 text-blue-400 border-blue-500/30"},
  classified:{label:"Klassifiziert",color:"bg-cyan-500/20 text-cyan-400 border-cyan-500/30"},
  validated:{label:"Validiert",color:"bg-teal-500/20 text-teal-400 border-teal-500/30"},
  suggested:{label:"KI-Vorschlag",color:"bg-violet-500/20 text-violet-400 border-violet-500/30"},
  approved:{label:"Freigegeben",color:"bg-emerald-500/20 text-emerald-400 border-emerald-500/30"},
  exported:{label:"Exportiert",color:"bg-green-500/20 text-green-400 border-green-500/30"},
  archived:{label:"Archiviert",color:"bg-gray-500/20 text-gray-400 border-gray-500/30"},
  rejected:{label:"Abgelehnt",color:"bg-red-500/20 text-red-400 border-red-500/30"},
  error:{label:"Fehler",color:"bg-red-500/20 text-red-400 border-red-500/30"},
};

export default function InvoiceDetailPage() {
  const { id } = useParams<{id:string}>();
  const { user, token } = useAuth();
  const [invoice, setInvoice] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [kontierung, setKontierung] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");


  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  useEffect(() => {
    if (!token || !id) return;
    const h = { "X-Tenant-ID": user?.tenant_id || "", Authorization: "Bearer " + token };
    Promise.all([
      fetch(API+"/invoices/"+id, {headers:h}).then(r=>r.json()),
      fetch(API+"/invoices/"+id+"/events", {headers:h}).then(r=>r.json()).catch(()=>[]),
      fetch(API+"/invoices/"+id+"/kontierung", {headers:h}).then(r=>r.ok?r.json():null).catch(()=>null),
    ]).then(([inv, ev, ko]) => {
      setInvoice(inv);
      setEvents(Array.isArray(ev)?ev:ev.events||[]);
      setKontierung(ko);
    }).finally(() => 
      // Duplicate + Anomaly checks
      if (id) {
        fetch(API + "/invoices/" + id + "/duplicate-check", { headers: h }).then(r => r.ok ? r.json() : null).then(d => { if (d) setDuplicates(d.duplicates || []); }).catch(() => {});
        fetch(API + "/invoices/" + id + "/anomaly-check", { headers: h }).then(r => r.ok ? r.json() : null).then(d => { if (d) setAnomalies(d.anomalies || []); }).catch(() => {});
      }
      setLoading(false));
  }, [token, id, user]);

  const transition = async (to: string) => {
    const h = { "Content-Type":"application/json", "X-Tenant-ID": user?.tenant_id || "", Authorization: "Bearer " + token };
    const r = await fetch(API+"/invoices/"+id+"/transition", { method:"POST", headers:h, body:JSON.stringify({to_state:to,actor:user?.name||"User"}) });
    if (r.ok) { setMsg("Status → "+to); location.reload(); } else { const d=await r.json(); setMsg("Fehler: "+(d.detail||r.status)); }
  };

  const exportDatev = async () => {
    const h = { "X-Tenant-ID": user?.tenant_id || "", Authorization: "Bearer " + token };
    const r = await fetch(API+"/invoices/"+id+"/datev-export", {headers:h});
    if (r.ok) { const d=await r.json(); setMsg("DATEV Export: "+(d.file_name||"OK")); } else setMsg("Export-Fehler");
  };

  if (!user) return null;

  if (loading) return (
    <div className="min-h-screen bg-[#f4f7fa] text-gray-900 flex items-center justify-center">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{animationDelay:"0ms"}}/>
        <div className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{animationDelay:"150ms"}}/>
        <div className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{animationDelay:"300ms"}}/>
      </div>
    </div>
  );

  if (!invoice) return (
    <div className="min-h-screen bg-[#f4f7fa] text-gray-900 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">Rechnung nicht gefunden</p>
        <a href="/dashboard/rechnungen" className="text-[#e85d04]">← Zurück</a>
      </div>
    </div>
  );

  const s = STATUS[invoice.current_state] || {label:invoice.current_state,color:"bg-[#262626] text-gray-500 border-[#404040]"};
  const NEXT: Record<string,string[]> = {
    uploaded:["classified"],classified:["validated","rejected"],validated:["suggested"],
    suggested:["approved","rejected"],approved:["exported"],exported:["archived"],
  };
  const nextStates = NEXT[invoice.current_state] || [];

  return (
    <div className="min-h-screen bg-[#f4f7fa] text-gray-900">
      <div className="border-b border-white/[0.06] bg-[#f4f7fa]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 pt-6 space-y-4">
        <DuplicateAlert duplicates={duplicates} />
        <AnomalyAlert anomalies={anomalies} />
      </div>
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard/rechnungen" className="text-gray-500 hover:text-gray-900 transition">← Rechnungen</a>
            <div className="h-6 w-px bg-[#262626]"/>
            <h1 className="text-lg font-semibold truncate max-w-[300px]">{invoice.file_name || id}</h1>
          </div>
          <span className={"text-xs px-3 py-1.5 rounded-full font-medium border "+s.color}>{s.label}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {msg && (
          <div className={"rounded-xl px-4 py-3 text-sm "+(msg.startsWith("Fehler")?"bg-red-500/10 text-red-400":"bg-emerald-500/10 text-emerald-400")}>
            {msg} <button onClick={()=>setMsg("")} className="float-right opacity-60">✕</button>
          </div>
        )}

        {/* Invoice Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/50 border border-gray-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Rechnungsdaten</h2>
            {[
              {l:"Dokument-ID",v:invoice.document_id},
              {l:"Datei",v:invoice.file_name||"—"},
              {l:"Lieferant",v:invoice.supplier||"—"},
              {l:"Betrag",v:invoice.total_amount?new Intl.NumberFormat("de-DE",{style:"currency",currency:invoice.currency||"EUR"}).format(invoice.total_amount):"—"},
              {l:"Status",v:s.label},
              {l:"Erstellt",v:new Date(invoice.created_at).toLocaleString("de-DE")},
            ].map((r,i)=>(
              <div key={i} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                <span className="text-sm text-gray-500">{r.l}</span>
                <span className="text-sm font-medium text-right max-w-[60%] truncate">{r.v}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {nextStates.length>0 && (
              <div className="bg-white/50 border border-gray-200 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Aktionen</h2>
                <div className="flex flex-wrap gap-2">
                  {nextStates.map(ns=>(
                    <button key={ns} onClick={()=>transition(ns)}
                      className={"px-4 py-2 rounded-xl text-sm font-medium transition "+(ns==="rejected"?"bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20":"bg-[#e85d04] hover:bg-[#f48c06] text-gray-900")}>
                      → {STATUS[ns]?.label||ns}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {["approved","exported"].includes(invoice.current_state) && (
              <button onClick={exportDatev} className="w-full py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-medium hover:bg-emerald-500/20 transition">
                📤 DATEV Export
              </button>
            )}

            {/* KI Kontierung */}
            {kontierung && (
              <div className="bg-white/50 border border-gray-200 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">🤖 KI-Kontierung</h2>
                {[
                  {l:"Sachkonto",v:kontierung.konto||"—"},
                  {l:"Gegenkonto",v:kontierung.gegenkonto||"—"},
                  {l:"Steuerschlüssel",v:kontierung.tax_code||"—"},
                  {l:"Konfidenz",v:kontierung.confidence?Math.round(kontierung.confidence*100)+"%":"—"},
                  {l:"Modell",v:kontierung.model||"—"},
                ].map((r,i)=>(
                  <div key={i} className="flex justify-between py-1.5 border-b border-gray-200 last:border-0">
                    <span className="text-xs text-gray-500">{r.l}</span>
                    <span className="text-xs font-medium">{r.v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Events Timeline */}
        <div className="bg-white/50 border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Verlauf ({events.length} Events)</h2>
          {events.length === 0 ? (
            <p className="text-sm text-gray-400">Keine Events vorhanden</p>
          ) : (
            <div className="space-y-3">
              {events.slice().reverse().map((ev,i)=>(
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-[#e85d04] mt-2 shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {ev.from_state && <span className="text-xs px-2 py-0.5 rounded bg-[#262626] text-gray-500">{ev.from_state}</span>}
                      {ev.from_state && ev.to_state && <span className="text-xs text-gray-400">→</span>}
                      {ev.to_state && <span className="text-xs px-2 py-0.5 rounded bg-[#262626] text-gray-600">{ev.to_state}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{ev.actor||"System"}</span>
                      <span className="text-xs text-[#404040]">·</span>
                      <span className="text-xs text-gray-400">{ev.timestamp?new Date(ev.timestamp).toLocaleString("de-DE"):""}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
