"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { flowcheckApi, setSession } from "@/lib/api-client";
import { BrandLink } from "@/components/Brand";
import { Spinner } from "@/components/States";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await flowcheckApi.login(email, password);
      setSession(res.token, res.user);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen");
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
            <h1 className="text-2xl font-semibold tracking-tight text-[#003856]">Willkommen zurück</h1>
            <p className="mt-1 text-sm text-stone-500">Melden Sie sich bei FlowCheck AI+ an.</p>

            {error && (
              <div className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">E-Mail</label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/10"
                  placeholder="name@firma.de"
                />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-sm font-medium text-stone-700">Passwort</label>
                  <Link href="/forgot-password" className="text-sm font-medium text-[#003856] hover:underline">
                    Passwort vergessen?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/10"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#003856] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#002a42] disabled:opacity-60"
              >
                {loading && <Spinner className="h-4 w-4 text-white" />}
                {loading ? "Anmeldung läuft …" : "Anmelden"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-stone-500">
            Noch kein Konto?{" "}
            <Link href="/register" className="font-medium text-[#003856] hover:underline">
              Jetzt registrieren
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
