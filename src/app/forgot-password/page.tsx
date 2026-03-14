"use client";
import { useState } from "react";
import Link from "next/link";

const API = "https://app.sbsdeutschland.com/api/erechnung";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const r = await fetch(API+"/auth/forgot-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
      if(r.ok) setSent(true); else { const d=await r.json(); throw new Error(d.detail||"Fehler"); }
    } catch(err:any){setError(err.message);} finally{setLoading(false);}
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-[#e85d04] rounded-xl flex items-center justify-center font-bold text-white text-sm">BF</div>
            <span className="text-2xl font-bold text-white" style={{fontFamily:"'Instrument Serif',serif"}}>BelegFlow AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Passwort zurücksetzen</h1>
        </div>
        {sent?(
          <div className="bg-[#171717]/50 border border-[#262626] rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">✉️</div>
            <h2 className="text-lg font-semibold text-white mb-2">E-Mail gesendet</h2>
            <p className="text-sm text-[#737373] mb-6">Falls ein Konto mit <strong className="text-white">{email}</strong> existiert, erhalten Sie ein neues Passwort.</p>
            <Link href="/login" className="inline-flex px-6 py-2.5 bg-[#e85d04] rounded-xl text-sm font-medium hover:bg-[#f48c06] transition">Zum Login</Link>
          </div>
        ):(
          <form onSubmit={handle} className="bg-[#171717]/50 border border-[#262626] rounded-2xl p-6 sm:p-8 space-y-5">
            {error&&<div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-[#d4d4d4] mb-1.5">E-Mail</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="name@unternehmen.de"
                className="w-full bg-[#0f0f0f] border border-[#404040] rounded-xl px-4 py-3 text-white placeholder-[#525252] text-sm focus:outline-none focus:border-[#e85d04]"/>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#e85d04] hover:bg-[#f48c06] text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 text-sm">
              {loading?"Wird gesendet...":"Reset-Link senden"}
            </button>
            <p className="text-sm text-[#525252] text-center"><Link href="/login" className="text-[#f48c06] hover:text-[#e85d04] font-medium">Zurück zum Login</Link></p>
          </form>
        )}
      </div>
    </div>
  );
}
