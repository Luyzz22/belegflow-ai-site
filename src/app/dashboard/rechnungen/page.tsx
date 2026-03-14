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

  const filtered = invoices.filter(inv => {
    const matchSearch = !search || (inv.file_name||"").toLowerCase().includes(search.toLowerCase()) || (inv.supplier||"").toLowerCase().includes(search.toLowerCase()) || inv.document_id.includes(search);
    const matchStatus = filterStatus==="all" || inv.current_state===filterStatus;
    return matchSearch && matchStatus;
  });

  if(!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-[#737373] hover:text-white transition">← Dashboard</a>
            <div className="h-6 w-px bg-[#262626]"/>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e85d04] to-[#f48c06] flex items-center justify-center text-lg">📄</div>
              <div><h1 className="text-lg font-semibold">Rechnungen</h1><p className="text-xs text-[#737373]">{filtered.length} von {invoices.length} Belegen</p></div>
            </div>
          </div>
          <label className={"inline-flex items-center gap-2 px-5 py-2.5 bg-[#e85d04] hover:bg-[#f48c06] rounded-xl text-sm font-medium cursor-pointer transition "+(uploading?"opacity-50 pointer-events-none":"")}>
            <span>{uploading?"Wird hochgeladen...":"⬆️ Hochladen"}</span>
            <input type="file" accept=".pdf,.xml,.png,.jpg,.jpeg" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f) upload(f); e.target.value="";}}/>
          </label>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {msg&&<div className={"mb-4 rounded-xl px-4 py-3 text-sm "+(msg.startsWith("Fehler")?"bg-red-500/10 text-red-400 border border-red-500/30":"bg-emerald-500/10 text-emerald-400 border border-emerald-500/30")}>{msg}<button onClick={()=>setMsg("")} className="float-right opacity-60">✕</button></div>}

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#525252]">🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Suche nach Datei, Lieferant oder ID..."
              className="w-full bg-[#171717]/50 border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#525252] focus:outline-none focus:border-[#e85d04] transition"/>
          </div>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
            className="bg-[#171717]/50 border border-[#262626] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e85d04]">
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
            <p className="text-[#737373] text-sm mb-6">{search||filterStatus!=="all"?"Versuchen Sie andere Suchbegriffe oder Filter.":"Laden Sie Ihre erste Rechnung hoch."}</p>
            {!search&&filterStatus==="all"&&<label className="inline-flex items-center gap-2 px-6 py-3 bg-[#e85d04] rounded-xl text-sm font-medium cursor-pointer"><span>Erste Rechnung hochladen</span><input type="file" accept=".pdf,.xml,.png,.jpg,.jpeg" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f) upload(f); e.target.value="";}}/></label>}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-xs text-[#525252] uppercase tracking-wider font-medium">
              <div className="col-span-4">Datei</div><div className="col-span-2">Status</div><div className="col-span-2">Lieferant</div><div className="col-span-2 text-right">Betrag</div><div className="col-span-2 text-right">Aktionen</div>
            </div>
            {filtered.map((inv,i)=>{
              const s=STATUS[inv.current_state]||{label:inv.current_state,color:"bg-[#262626] text-[#737373]"};
              return (
                <a key={i} href={`/dashboard/rechnungen/${inv.document_id}`} className="block bg-[#171717]/50 border border-[#262626] rounded-xl px-4 py-3 hover:border-[#404040] transition grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
                  <div className="col-span-4">
                    <p className="text-sm font-medium text-white truncate">{inv.file_name||inv.document_id}</p>
                    <p className="text-xs text-[#525252] mt-0.5">{new Date(inv.created_at).toLocaleDateString("de-DE")} · {inv.document_id.slice(0,8)}</p>
                  </div>
                  <div className="col-span-2"><span className={"text-xs px-2.5 py-1 rounded-full font-medium "+s.color}>{s.label}</span></div>
                  <div className="col-span-2"><span className="text-sm text-[#a3a3a3]">{inv.supplier||"—"}</span></div>
                  <div className="col-span-2 text-right"><span className="text-sm font-medium">{inv.total_amount?new Intl.NumberFormat("de-DE",{style:"currency",currency:inv.currency||"EUR"}).format(inv.total_amount):"—"}</span></div>
                  <div className="col-span-2 text-right"><span className="text-xs text-[#e85d04]">Details →</span></div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
