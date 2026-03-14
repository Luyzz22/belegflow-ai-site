"use client";
import { useState } from "react";
import Link from "next/link";

const API = "https://app.sbsdeutschland.com/api/erechnung";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch(API + "/users/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || "Login fehlgeschlagen"); }
      const d = await res.json();
      localStorage.setItem("bf_token", d.tokens.access_token);
      localStorage.setItem("bf_refresh", d.tokens.refresh_token);
      localStorage.setItem("bf_user", JSON.stringify(d.user));
      window.location.href = "/dashboard";
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-[#e85d04] rounded-xl flex items-center justify-center font-bold text-white text-sm">BF</div>
            <span className="text-2xl font-bold text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>BelegFlow AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Willkommen zurück</h1>
          <p className="text-[#a3a3a3] mt-2 text-sm">Melden Sie sich bei Ihrem Konto an</p>
        </div>
        <form onSubmit={handle} className="bg-[#171717]/50 border border-[#262626] rounded-2xl p-6 sm:p-8 space-y-5">
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-[#d4d4d4] mb-1.5">E-Mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@unternehmen.de"
              className="w-full bg-[#0f0f0f] border border-[#404040] rounded-xl px-4 py-3 text-white placeholder-[#525252] text-sm focus:outline-none focus:border-[#e85d04] focus:ring-1 focus:ring-[#e85d04] transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#d4d4d4] mb-1.5">Passwort</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
              className="w-full bg-[#0f0f0f] border border-[#404040] rounded-xl px-4 py-3 text-white placeholder-[#525252] text-sm focus:outline-none focus:border-[#e85d04] focus:ring-1 focus:ring-[#e85d04] transition" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#e85d04] hover:bg-[#f48c06] text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 text-sm">
            {loading ? "Wird angemeldet..." : "Anmelden"}
          </button>
          <p className="text-sm text-[#525252] text-center">
            Noch kein Konto? <Link href="/register" className="text-[#f48c06] hover:text-[#e85d04] font-medium">Registrieren</Link>
          </p>
        </form>
        <p className="text-center text-xs text-[#404040] mt-6">BelegFlow AI — Ein Produkt von SBS Deutschland GmbH & Co. KG</p>
      </div>
    </div>
  );
}
