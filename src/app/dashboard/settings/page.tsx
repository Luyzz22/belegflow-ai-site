"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";

const API = "https://app.sbsdeutschland.com/api/erechnung";

export default function SettingsPage() {
  const { user, token, logout } = useAuth();
  const [tab, setTab] = useState<"profile"|"billing"|"team">("profile");
  const [sub, setSub] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [inv, setInv] = useState({email:"",name:"",role:"editor"});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(API+"/billing/subscription",{headers:{Authorization:"Bearer "+token}}).then(r=>r.json()).then(setSub).catch(()=>{});
    fetch(API+"/billing/usage",{headers:{Authorization:"Bearer "+token}}).then(r=>r.json()).then(setUsage).catch(()=>{});
    fetch(API+"/users/team",{headers:{Authorization:"Bearer "+token}}).then(r=>r.json()).then(setTeam).catch(()=>{});
  },[token]);

  const invite = async () => {
    setMsg("");
    try {
      const r = await fetch(API+"/users/invite",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify(inv)});
      const d = await r.json();
      if(r.ok){setMsg("Einladung gesendet an "+inv.email);setInv({email:"",name:"",role:"editor"});
        fetch(API+"/users/team",{headers:{Authorization:"Bearer "+token}}).then(r=>r.json()).then(setTeam).catch(()=>{});
      } else setMsg("Fehler: "+(d.detail||"Unbekannt"));
    } catch{setMsg("Verbindungsfehler");}
  };

  const rm = async (id:string) => {
    if(!confirm("Benutzer entfernen?")) return;
    const r = await fetch(API+"/users/"+id,{method:"DELETE",headers:{Authorization:"Bearer "+token}});
    if(r.ok) setTeam(team.filter(u=>u.id!==id));
  };

  if(!user) return null;
  const PN:Record<string,string> = {starter:"Starter",professional:"Professional",enterprise:"Enterprise"};
  const RL:Record<string,string> = {admin:"Admin",editor:"Editor",viewer:"Viewer"};

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <a href="/dashboard" className="text-[#737373] hover:text-white transition">&larr; Dashboard</a>
          <div className="h-6 w-px bg-[#262626]"/>
          <h1 className="text-lg font-semibold">Einstellungen</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-1 mb-8 bg-[#171717]/50 border border-[#262626] rounded-xl p-1">
          {(["profile","billing","team"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={"flex-1 py-2.5 rounded-lg text-sm font-medium transition "+(tab===t?"bg-[#262626] text-white":"text-[#737373] hover:text-white")}>
              {t==="profile"?"Profil":t==="billing"?"Abonnement":"Team"}
            </button>
          ))}
        </div>

        {tab==="profile"&&(
          <div className="space-y-6">
            <div className="bg-[#171717]/50 border border-[#262626] rounded-xl p-6">
              <h2 className="text-sm font-semibold text-[#d4d4d4] mb-4">Profil</h2>
              {[{l:"Name",v:user.name},{l:"E-Mail",v:user.email},{l:"Firma",v:user.company||"—"},{l:"Rolle",v:RL[user.role]||user.role},{l:"Tenant",v:user.tenant_id}].map((r,i)=>(
                <div key={i} className="flex justify-between py-2 border-b border-[#262626] last:border-0">
                  <span className="text-sm text-[#737373]">{r.l}</span><span className="text-sm font-medium">{r.v}</span>
                </div>
              ))}
            </div>
            <button onClick={logout} className="w-full py-3 border border-red-500/30 text-red-400 rounded-xl text-sm hover:bg-red-500/10 transition">Abmelden</button>
          </div>
        )}

        {tab==="billing"&&sub&&(
          <div className="space-y-6">
            <div className="bg-[#171717]/50 border border-[#262626] rounded-xl p-6">
              <div className="flex justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#d4d4d4]">Aktueller Plan</h2>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">{sub.status==="active"?"Aktiv":sub.status}</span>
              </div>
              <p className="text-3xl font-bold mb-4">{PN[sub.plan]||sub.plan}</p>
              {usage&&(
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2"><span className="text-[#737373]">Rechnungen</span><span>{usage.used}/{usage.limit==="unlimited"?"∞":usage.limit}</span></div>
                  {usage.limit!=="unlimited"&&<div className="w-full bg-[#262626] rounded-full h-2"><div className="bg-[#e85d04] h-2 rounded-full" style={{width:Math.min(100,(usage.used/usage.limit)*100)+"%"}}/></div>}
                </div>
              )}
            </div>
            {sub.plan==="starter"&&(
              <div className="bg-gradient-to-r from-[#e85d04]/10 to-[#171717] border border-[#e85d04]/20 rounded-xl p-6">
                <h3 className="font-semibold mb-2">Upgrade auf Professional</h3>
                <p className="text-sm text-[#737373] mb-4">500 Rechnungen/Monat, Gemini + Claude, Finance Copilot</p>
                <a href="mailto:ki@sbsdeutschland.de" className="inline-flex px-6 py-2.5 bg-[#e85d04] rounded-xl text-sm font-medium hover:bg-[#f48c06] transition">Upgrade anfragen</a>
              </div>
            )}
          </div>
        )}

        {tab==="team"&&(
          <div className="space-y-6">
            <div className="bg-[#171717]/50 border border-[#262626] rounded-xl p-6">
              <h2 className="text-sm font-semibold text-[#d4d4d4] mb-4">Team</h2>
              {team.map((u,i)=>(
                <div key={i} className="flex items-center justify-between py-3 border-b border-[#262626] last:border-0">
                  <div><p className="text-sm font-medium">{u.name}</p><p className="text-xs text-[#525252]">{u.email}</p></div>
                  <div className="flex items-center gap-3">
                    <span className={"text-xs px-2 py-1 rounded-full "+(u.role==="admin"?"bg-[#e85d04]/10 text-[#f48c06]":"bg-[#262626] text-[#737373]")}>{RL[u.role]||u.role}</span>
                    {user.role==="admin"&&u.email!==user.email&&<button onClick={()=>rm(u.id)} className="text-xs text-red-400">Entfernen</button>}
                  </div>
                </div>
              ))}
            </div>
            {user.role==="admin"&&(
              <div className="bg-[#171717]/50 border border-[#262626] rounded-xl p-6">
                <h2 className="text-sm font-semibold text-[#d4d4d4] mb-4">Einladen</h2>
                {msg&&<div className={"rounded-xl px-4 py-3 text-sm mb-4 "+(msg.startsWith("Fehler")?"bg-red-500/10 text-red-400":"bg-emerald-500/10 text-emerald-400")}>{msg}</div>}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <input value={inv.name} onChange={e=>setInv({...inv,name:e.target.value})} placeholder="Name" className="bg-[#0f0f0f] border border-[#404040] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#525252] focus:outline-none focus:border-[#e85d04]"/>
                  <input value={inv.email} onChange={e=>setInv({...inv,email:e.target.value})} placeholder="E-Mail" type="email" className="bg-[#0f0f0f] border border-[#404040] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#525252] focus:outline-none focus:border-[#e85d04]"/>
                  <select value={inv.role} onChange={e=>setInv({...inv,role:e.target.value})} className="bg-[#0f0f0f] border border-[#404040] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e85d04]">
                    <option value="editor">Editor</option><option value="viewer">Viewer</option><option value="admin">Admin</option>
                  </select>
                </div>
                <button onClick={invite} disabled={!inv.email||!inv.name} className="px-6 py-2.5 bg-[#e85d04] rounded-xl text-sm font-medium hover:bg-[#f48c06] disabled:opacity-40 transition">Einladung senden</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
