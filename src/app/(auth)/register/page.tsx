"use client";

import { useState } from "react";
import Link from "next/link";
import { flowcheckApi, setSession } from "@/lib/api-client";
import { BrandLink, LogoMark } from "@/components/Brand";
import { Spinner } from "@/components/States";
import { ShieldCheck, Landmark, Sparkles, Lock } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      setError("Bitte akzeptieren Sie AGB und Datenschutzerklärung.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await flowcheckApi.register(email, password, name);
      setSession(res.token, res.user);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrierung fehlgeschlagen");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f3] lg:grid lg:grid-cols-2">
      {/* LEFT — Brand showcase (Desktop) */}
      <aside className="relative hidden flex-col justify-between bg-[#003856] p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark className="h-10 w-10" />
          <span className="text-xl font-semibold tracking-tight text-white">
            FlowCheck <span className="text-[#c8985a]">AI+</span>
          </span>
        </Link>

        <div className="max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            Eingangsrechnungen intelligent prüfen, freigeben und exportieren.
          </h2>
          <ul className="mt-10 space-y-5">
            <li className="flex items-start gap-3.5">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#c8985a]">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="text-sm leading-relaxed text-white/90">DSGVO-konform &amp; GoBD-ready</span>
            </li>
            <li className="flex items-start gap-3.5">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#c8985a]">
                <Landmark className="h-5 w-5" />
              </span>
              <span className="text-sm leading-relaxed text-white/90">DATEV-Export inklusive</span>
            </li>
            <li className="flex items-start gap-3.5">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#c8985a]">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="text-sm leading-relaxed text-white/90">KI-Prüfung in Sekunden</span>
            </li>
          </ul>
        </div>

        <p className="text-xs text-white/50">© {new Date().getFullYear()} FlowCheck AI+</p>
      </aside>

      {/* RIGHT — Form */}
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <div className="mb-8 lg:hidden">
          <BrandLink />
        </div>

        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-8 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
            <h1 className="text-2xl font-semibold tracking-tight text-[#003856]">Konto erstellen</h1>
            <p className="mt-1 text-sm text-[#64748b]">30 Tage kostenlos testen — keine Kreditkarte nötig.</p>

            {error && (
              <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1a1a2e]">Name</label>
                <input
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
                  placeholder="Max Mustermann"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1a1a2e]">E-Mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
                  placeholder="name@firma.de"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1a1a2e]">Passwort</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
                  placeholder="Mindestens 8 Zeichen"
                />
              </div>
              <label className="flex items-start gap-2.5 text-sm text-[#64748b]">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[rgba(0,56,86,0.2)] text-[#003856] focus:ring-[#003856]"
                />
                <span>
                  Ich akzeptiere die{" "}
                  <Link href="/agb" className="text-[#003856] hover:underline">AGB</Link> und die{" "}
                  <Link href="/datenschutz" className="text-[#003856] hover:underline">Datenschutzerklärung</Link>.
                </span>
              </label>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#003856] px-4 py-3 font-medium text-white transition-all hover:bg-[#002a42] disabled:opacity-60"
              >
                {loading && <Spinner className="h-4 w-4 text-white" />}
                {loading ? "Konto wird erstellt …" : "Konto erstellen"}
              </button>
            </form>
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-[#64748b]">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> 256-Bit Verschlüsselung
            </span>
            <span className="text-[#64748b]/40">·</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> 🇩🇪 Deutsche Server
            </span>
          </div>

          <p className="mt-6 text-center text-sm text-[#64748b]">
            Bereits registriert?{" "}
            <Link href="/login" className="font-medium text-[#003856] hover:underline">
              Anmelden
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
