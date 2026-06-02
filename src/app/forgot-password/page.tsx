"use client";

import { useState } from "react";
import Link from "next/link";
import { flowcheckApi } from "@/lib/api-client";
import { BrandLink } from "@/components/Brand";
import { Spinner } from "@/components/States";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await flowcheckApi.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Anfrage fehlgeschlagen");
    } finally {
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
            {sent ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl">
                  ✉️
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#003856]">E-Mail gesendet</h1>
                <p className="mt-2 text-sm text-stone-500">
                  Falls ein Konto mit{" "}
                  <span className="font-medium text-stone-700">{email}</span> existiert, haben wir Ihnen einen Link zum
                  Zurücksetzen des Passworts geschickt. Bitte prüfen Sie auch Ihren Spam-Ordner.
                </p>
                <Link
                  href="/login"
                  className="mt-6 inline-block rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#002a42]"
                >
                  Zurück zum Login
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-semibold tracking-tight text-[#003856]">Passwort vergessen?</h1>
                <p className="mt-1 text-sm text-stone-500">
                  Geben Sie Ihre E-Mail-Adresse ein — wir senden Ihnen einen Link zum Zurücksetzen.
                </p>

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
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#003856] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#002a42] disabled:opacity-60"
                  >
                    {loading && <Spinner className="h-4 w-4 text-white" />}
                    {loading ? "Wird gesendet …" : "Link senden"}
                  </button>
                </form>
              </>
            )}
          </div>

          {!sent && (
            <p className="mt-6 text-center text-sm text-stone-500">
              Passwort wieder eingefallen?{" "}
              <Link href="/login" className="font-medium text-[#003856] hover:underline">
                Zum Login
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
