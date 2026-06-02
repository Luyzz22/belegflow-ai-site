"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { flowcheckApi, setSession } from "@/lib/api-client";
import { BrandLink } from "@/components/Brand";
import { Spinner } from "@/components/States";

export default function RegisterPage() {
  const router = useRouter();
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
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrierung fehlgeschlagen");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7fa]">
      <div className="flex h-16 items-center px-6">
        <BrandLink />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200/60">
            <h1 className="text-2xl font-semibold tracking-tight text-[#003856]">Konto erstellen</h1>
            <p className="mt-1 text-sm text-stone-500">30 Tage kostenlos testen — keine Kreditkarte nötig.</p>

            {error && (
              <div className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Name</label>
                <input
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/10"
                  placeholder="Max Mustermann"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">E-Mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/10"
                  placeholder="name@firma.de"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Passwort</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/10"
                  placeholder="Mindestens 8 Zeichen"
                />
              </div>
              <label className="flex items-start gap-2.5 text-sm text-stone-600">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#003856] focus:ring-[#003856]"
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#003856] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#002a42] disabled:opacity-60"
              >
                {loading && <Spinner className="h-4 w-4 text-white" />}
                {loading ? "Konto wird erstellt …" : "Kostenlos starten"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-stone-500">
            Bereits registriert?{" "}
            <Link href="/login" className="font-medium text-[#003856] hover:underline">
              Anmelden
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
