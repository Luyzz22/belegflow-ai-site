"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { useAuth } from "@/lib/useAuth";

const API = process.env.NEXT_PUBLIC_API_URL || "https://app.sbsdeutschland.com/api/erechnung";
const MONATE = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];

export default function BudgetPage() {
  const { user, token } = useAuth();
  const [jahr, setJahr] = useState(2026);
  const [kategorien, setKategorien] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [monatData, setMonatData] = useState<any[]>([]);
  const [selMonat, setSelMonat] = useState(new Date().getMonth()+1);
  const [loading, setLoading] = useState(true);
  const [editKat, setEditKat] = useState<number|null>(null);
  const [editVal, setEditVal] = useState("");

  const headers = () => ({Authorization:`Bearer ${token}`,"X-Tenant-ID":user?.tenant_id||"","Content-Type":"application/json"});

  const load = async () => {
    if (!token) return;
    try {
      const [kRes,sRes,mRes] = await Promise.all([
        fetch(`${API}/budget/kategorien`,{headers:headers()}),
        fetch(`${API}/budget/summary?jahr=${jahr}`,{headers:headers()}),
        fetch(`${API}/budget/monat?jahr=${jahr}&monat=${selMonat}`,{headers:headers()}),
      ]);
      setKategorien(await kRes.json());
      setSummary(await sRes.json());
      setMonatData(await mRes.json());
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [token, user, jahr, selMonat]);

  const saveBudget = async (katId: number) => {
    const betrag = parseFloat(editVal);
    if (isNaN(betrag)) return;
    await fetch(`${API}/budget/set`,{method:"POST",headers:headers(),body:JSON.stringify({kategorie_id:katId,jahr,monat:selMonat,betrag})});
    setEditKat(null);
    setEditVal("");
    load();
  };

  if (!user) return null;

  const budgetTotal = summary?.budget_total || 0;
  const actualTotal = summary?.actual_total || 0;
  const util = summary?.utilization || 0;
  const chartData = (summary?.kategorien || []).map((k:any) => ({name:k.name.length>12?k.name.slice(0,12)+"…":k.name,budget:k.budget,actual:k.actual}));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-[#737373] hover:text-white transition text-sm">← Dashboard</a>
            <div className="h-5 w-px bg-[#262626]" />
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-base">📋</div>
              <div><h1 className="text-base font-semibold leading-tight">Budget</h1><p className="text-[11px] text-[#525252]">Jahresplanung {jahr}</p></div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {[2025,2026,2027].map(y=>(<button key={y} onClick={()=>setJahr(y)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${jahr===y?"bg-[#e85d04] text-white":"text-[#737373] hover:text-white bg-[#171717] border border-[#262626]"}`}>{y}</button>))}
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {loading ? (<div className="flex justify-center py-24"><div className="flex gap-1.5">{[0,150,300].map(d=>(<div key={d} className="w-2.5 h-2.5 bg-[#e85d04] rounded-full animate-bounce" style={{animationDelay:`${d}ms`}} />))}</div></div>) : (<>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {l:"Budget Gesamt",v:budgetTotal.toLocaleString("de-DE",{style:"currency",currency:"EUR"}),a:"from-blue-500/20 to-indigo-500/10"},
              {l:"Ist-Ausgaben",v:actualTotal.toLocaleString("de-DE",{style:"currency",currency:"EUR"}),a:"from-amber-500/20 to-orange-500/10"},
              {l:"Auslastung",v:`${util}%`,a:util>90?"from-red-500/20 to-rose-500/10":util>70?"from-amber-500/20 to-yellow-500/10":"from-emerald-500/20 to-green-500/10"},
              {l:"Kategorien",v:String(kategorien.length),a:"from-violet-500/20 to-purple-500/10"},
            ].map((k,i)=>(<div key={i} className={`bg-gradient-to-br ${k.a} border border-[#262626] rounded-xl p-5`}><p className="text-[11px] text-[#737373] uppercase tracking-wider font-medium">{k.l}</p><p className="text-xl font-bold mt-1.5">{k.v}</p></div>))}
          </div>

          {/* Budget vs Actual Chart */}
          {chartData.length > 0 && (<div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6">
            <h3 className="text-sm font-semibold text-[#a3a3a3] mb-5">Budget vs. Ist nach Kategorie</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" horizontal={false} /><XAxis type="number" stroke="#404040" tick={{fontSize:10,fill:"#525252"}} /><YAxis type="category" dataKey="name" stroke="#404040" tick={{fontSize:11,fill:"#737373"}} width={100} /><Tooltip contentStyle={{background:"#171717",border:"1px solid #262626",borderRadius:8,fontSize:12}} /><Bar dataKey="budget" fill="#6366f1" radius={[0,4,4,0]} barSize={12} name="Budget" /><Bar dataKey="actual" fill="#e85d04" radius={[0,4,4,0]} barSize={12} name="Ist" /></BarChart>
            </ResponsiveContainer>
          </div>)}

          {/* Monthly Budget Editor */}
          <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-[#a3a3a3]">Monatsbudget bearbeiten</h3>
              <div className="flex gap-1 flex-wrap">
                {MONATE.map((m,i)=>(<button key={i} onClick={()=>setSelMonat(i+1)} className={`px-2 py-1 rounded text-[10px] font-medium transition ${selMonat===i+1?"bg-[#e85d04] text-white":"text-[#525252] hover:text-white bg-[#1a1a1a] border border-[#262626]"}`}>{m}</button>))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="hidden sm:grid grid-cols-12 gap-4 px-3 py-2 text-[10px] text-[#404040] uppercase tracking-widest">
                <div className="col-span-4">Kategorie</div><div className="col-span-3">Konten</div><div className="col-span-3 text-right">Budget</div><div className="col-span-2 text-right">Aktion</div>
              </div>
              {monatData.map((m:any)=>(<div key={m.kategorie_id} className="grid grid-cols-12 gap-4 px-3 py-2.5 rounded-lg hover:bg-[#1a1a1a] transition items-center">
                <div className="col-span-4 text-sm">{m.name}</div>
                <div className="col-span-3 text-xs text-[#525252] font-mono">{kategorien.find((k:any)=>k.id===m.kategorie_id)?.konten_mapping||""}</div>
                <div className="col-span-3 text-right">
                  {editKat===m.kategorie_id ? (<input type="number" value={editVal} onChange={e=>setEditVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveBudget(m.kategorie_id)} className="w-24 bg-[#0a0a0a] border border-[#e85d04] rounded px-2 py-1 text-sm text-right text-white focus:outline-none" autoFocus />) : (<span className="text-sm font-medium">{m.betrag.toLocaleString("de-DE",{style:"currency",currency:"EUR"})}</span>)}
                </div>
                <div className="col-span-2 text-right">
                  {editKat===m.kategorie_id ? (<button onClick={()=>saveBudget(m.kategorie_id)} className="text-xs text-emerald-400 hover:text-emerald-300">Speichern</button>) : (<button onClick={()=>{setEditKat(m.kategorie_id);setEditVal(String(m.betrag));}} className="text-xs text-[#525252] hover:text-white">Bearbeiten</button>)}
                </div>
              </div>))}
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
}
