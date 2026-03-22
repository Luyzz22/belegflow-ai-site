"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/useAuth";

const API = "https://app.sbsdeutschland.com/api/erechnung";
const STATUS: Record<string,{label:string,color:string}> = {
  uploaded:{label:"Hochgeladen",color:"bg-blue-500/20 text-blue-400"},classified:{label:"Klassifiziert",color:"bg-cyan-500/20 text-cyan-400"},
  validated:{label:"Validiert",color:"bg-teal-500/20 text-teal-400"},suggested:{label:"KI-Vorschlag",color:"bg-violet-500/20 text-violet-400"},
  approved:{label:"Freigegeben",color:"bg-emerald-500/20 text-emerald-400"},exported:{label:"Exportiert",color:"bg-green-500/20 text-green-400"},
  archived:{label:"Archiviert",color:"bg-gray-500/20 text-gray-400"},rejected:{label:"Abgelehnt",color:"bg-red-500/20 text-red-400"},error:{label:"Fehler",color:"bg-red-500/20 text-red-400"},
};

interface Invoice { document_id:string; file_name:string; current_state:string; created_at:string; supplier?:string; total_amount?:number; currency?:string; }

export default function RechnungenPage() {
  const { user, token } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!token) return; setLoading(true);
    try {
      const r = await fetch(API+"/invoices",{headers:{"X-Tenant-ID":user?.tenant_id||"",Authorization:"Bearer "+token}});
      if(r.ok){const d=await r.json(); setInvoices(Array.isArray(d)?d:d.invoices||[]);}
    } catch {} finally { setLoading(false); }
  },[token,user]);

  useEffect(()=>{load();},[load]);

  const upload = async (file:File) => {
    setUploading(true); setMsg("");
    const fd = new FormData(); fd.append("file",file);
    try {
      const r = await fetch(API+"/invoices/upload",{method:"POST",headers:{"X-Tenant-ID":user?.tenant_id||"",Authorization:"Bearer "+token},body:fd});
      if(r.ok){const d=await r.json(); setMsg("✅ Rechnung hochgeladen: "+d.document_id); load();}
      else {const d=await r.json(); setMsg("Fehler: "+(d.detail||r.status));}
    } catch{setMsg("Fehler: Verbindungsfehler");} finally{setUploading(false);}
  };

  const batchExport = async () => {
    if(selected.size===0) return;
    setMsg(""); let ok=0, fail=0;
    for(const id of selected) {
      try {
        const r = await fetch(API+"/invoices/"+id+"/datev-export",{headers:{"X-Tenant-ID":user?.tenant_id||"",Authorization:"Bearer "+token}});
        if(r.ok) ok++; else fail++;
      } catch { fail++; }
    }
    setMsg(`✅ DATEV Export: ${ok} erfolgreich${fail>0?`, ${fail} fehlgeschlagen`:""}`);
    setSelected(new Set());
  };

  const toggleSelect = (id:string) => {
    const n = new Set(selected);
    if(n.has(id)) n.delete(id); else n.add(id);
    setSelected(n);
  };

  const toggleAll = () => {
    if(selected.size===filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(i=>i.document_id)));
  };

  const filtered = invoices.filter(inv => {
    const ms = !search || (inv.file_name||"").toLowerCase().includes(search.toLowerCase()) || (inv.supplier||"").toLowerCase().includes(search.toLowerCase()) || inv.document_id.includes(search);
    const mf = filterStatus==="all" || inv.current_state===filterStatus;
    return ms && mf;
  });

  if(!user) return null;

  const exportable = [...selected].filter(id => {
    const inv = invoices.find(i=>i.document_id===id);
    return inv && ["approved","exported"].includes(inv.current_state);
  });

  return (
    <div className="min-h-screen bg-[#f4f7fa] text-gray-900">
      <div className="border-b border-white/[0.06] bg-[#f4f7fa]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-gray-500 hover:text-gray-900 transition">← Dashboard</a>
            <div className="h-6 w-px bg-[#262626]"/>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e85d04] to-[#f48c06] flex items-center justify-center text-lg">📄</div>
              <div><h1 className="text-lg font-semibold">Rechnungen</h1><p className="text-xs text-gray-500">{filtered.length} von {invoices.length} Belegen</p></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selected.size>0 && exportable.length>0 && (
              <button onClick={batchExport} className="px-4 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-medium hover:bg-emerald-500/20 transition">
                📤 DATEV ({exportable.length})
              </button>
            )}
            {selected.size>0 && <span className="text-xs text-gray-500">{selected.size} ausgewählt</span>}
            <label className={"inline-flex items-center gap-2 px-5 py-2.5 bg-[#e85d04] hover:bg-[#f48c06] rounded-xl text-sm font-medium cursor-pointer transition "+(uploading?"opacity-50 pointer-events-none":"")}>
              <span>{uploading?"Hochladen...":"⬆️ Hochladen"}</span>
              <input type="file" accept=".pdf,.xml,.png,.jpg,.jpeg" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f) upload(f); e.target.value="";}}/>
            </label>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {msg&&<div className={"mb-4 rounded-xl px-4 py-3 text-sm "+(msg.startsWith("Fehler")?"bg-red-500/10 text-red-400 border border-red-500/30":"bg-emerald-500/10 text-emerald-400 border border-emerald-500/30")}>{msg}<button onClick={()=>setMsg("")} className="float-right opacity-60">✕</button></div>}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Suche nach Datei, Lieferant oder ID..."
              className="w-full bg-white/50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-[#525252] focus:outline-none focus:border-[#e85d04] transition"/>
          </div>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
            className="bg-white/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#e85d04]">
            <option value="all">Alle Status</option>
            {Object.entries(STATUS).map(([k,v])=>(<option key={k} value={k}>{v.label}</option>))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="flex gap-1.5">
            <div className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{animationDelay:"0ms"}}/><div className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{animationDelay:"150ms"}}/><div className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{animationDelay:"300ms"}}/>
          </div></div>
        ) : filtered.length===0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">{search||filterStatus!=="all"?"🔍":"📄"}</div>
            <h2 className="text-xl font-semibold mb-2">{search||filterStatus!=="all"?"Keine Treffer":"Keine Rechnungen"}</h2>
            <p className="text-gray-500 text-sm mb-6">{search||filterStatus!=="all"?"Versuchen Sie andere Filter.":"Laden Sie Ihre erste Rechnung hoch."}</p>
            {!search&&filterStatus==="all"&&<label className="inline-flex items-center gap-2 px-6 py-3 bg-[#e85d04] rounded-xl text-sm font-medium cursor-pointer"><span>Erste Rechnung hochladen</span><input type="file" accept=".pdf,.xml,.png,.jpg,.jpeg" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f) upload(f); e.target.value="";}}/></label>}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-xs text-gray-400 uppercase tracking-wider font-medium">
              <div className="col-span-1"><button onClick={toggleAll} className="w-4 h-4 rounded border border-[#404040] flex items-center justify-center text-[10px] hover:border-[#e85d04] transition">{selected.size===filtered.length&&filtered.length>0?"✓":""}</button></div>
              <div className="col-span-3">Datei</div><div className="col-span-2">Status</div><div className="col-span-2">Lieferant</div><div className="col-span-2 text-right">Betrag</div><div className="col-span-2 text-right">Aktionen</div>
            </div>
            {filtered.map((inv,i)=>{
              const s=STATUS[inv.current_state]||{label:inv.current_state,color:"bg-[#262626] text-gray-500"};
              const sel = selected.has(inv.document_id);
              return (
                <div key={i} className={"bg-white/50 border rounded-xl px-4 py-3 transition grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center "+(sel?"border-[#e85d04]/30 bg-[#e85d04]/5":"border-gray-200 hover:border-[#404040]")}>
                  <div className="col-span-1">
                    <button onClick={()=>toggleSelect(inv.document_id)} className={"w-4 h-4 rounded border flex items-center justify-center text-[10px] transition "+(sel?"border-[#e85d04] bg-[#e85d04] text-gray-900":"border-[#404040] hover:border-[#e85d04]")}>{sel?"✓":""}</button>
                  </div>
                  <a href={`/dashboard/rechnungen/${inv.document_id}`} className="col-span-3">
                    <p className="text-sm font-medium text-gray-900 truncate">{inv.file_name||inv.document_id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(inv.created_at).toLocaleDateString("de-DE")} · {inv.document_id.slice(0,8)}</p>
                  </a>
                  <div className="col-span-2"><span className={"text-xs px-2.5 py-1 rounded-full font-medium "+s.color}>{s.label}</span></div>
                  <div className="col-span-2"><span className="text-sm text-gray-600">{inv.supplier||"—"}</span></div>
                  <div className="col-span-2 text-right"><span className="text-sm font-medium">{inv.total_amount?new Intl.NumberFormat("de-DE",{style:"currency",currency:inv.currency||"EUR"}).format(inv.total_amount):"—"}</span></div>
                  <div className="col-span-2 text-right"><a href={`/dashboard/rechnungen/${inv.document_id}`} className="text-xs text-[#e85d04]">Details →</a></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
