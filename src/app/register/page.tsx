"use client";
import { useState } from "react";
import Link from "next/link";

const API = "https://app.sbsdeutschland.com/api/erechnung";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const up = (k: string, v: string) => setForm({ ...form, [k]: v });

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) { setError("Passwort muss mindestens 8 Zeichen lang sein"); return; }
    setLoading(true);
    try {
      const res = await fetch(API + "/users/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || "Registrierung fehlgeschlagen"); }
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
          <h1 className="text-2xl font-bold text-white">Konto erstellen</h1>
          <p className="text-[#a3a3a3] mt-2 text-sm">Starten Sie mit der KI-Rechnungsverarbeitung</p>
        </div>
        <form onSubmit={handle} className="bg-[#171717]/50 border border-[#262626] rounded-2xl p-6 sm:p-8 space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>}
          {[
            { k: "name", l: "Name", p: "Max Mustermann", t: "text", r: true },
            { k: "company", l: "Firma", p: "Muster GmbH (optional)", t: "text", r: false },
            { k: "email", l: "E-Mail", p: "name@unternehmen.de", t: "email", r: true },
            { k: "password", l: "Passwort", p: "Mindestens 8 Zeichen", t: "password", r: true },
          ].map(f => (
            <div key={f.k}>
              <label className="block text-sm font-medium text-[#d4d4d4] mb-1.5">{f.l}</label>
              <input type={f.t} value={(form as any)[f.k]} onChange={e => up(f.k, e.target.value)} required={f.r} placeholder={f.p}
                className="w-full bg-[#0f0f0f] border border-[#404040] rounded-xl px-4 py-3 text-white placeholder-[#525252] text-sm focus:outline-none focus:border-[#e85d04] focus:ring-1 focus:ring-[#e85d04] transition" />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-[#e85d04] hover:bg-[#f48c06] text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 text-sm">
            {loading ? "Wird erstellt..." : "Kostenlos registrieren"}
          </button>
          <p className="text-sm text-[#525252] text-center">
            Bereits registriert? <Link href="/login" className="text-[#f48c06] hover:text-[#e85d04] font-medium">Anmelden</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
