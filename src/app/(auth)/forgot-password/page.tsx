"use client";

import { useState } from "react";
import Link from "next/link";
import { flowcheckApi } from "@/lib/api-client";
import { BrandLink } from "@/components/Brand";
import { Spinner } from "@/components/States";
import { ShieldCheck, Lock, MailCheck, ArrowLeft } from "lucide-react";

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f6f3] px-4 py-10">
      <div className="mb-8">
        <BrandLink />
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-8 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#003856]/5 text-[#003856]">
                <MailCheck className="h-7 w-7" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#003856]">E-Mail gesendet</h1>
              <p className="mt-2 text-sm text-[#64748b]">
                Falls ein Konto existiert, haben wir Ihnen einen Link gesendet. Bitte prüfen Sie auch Ihren
                Spam-Ordner.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 font-medium text-white transition-all hover:bg-[#002a42]"
              >
                <ArrowLeft className="h-4 w-4" />
                Zurück zum Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-[#003856]">Passwort zurücksetzen</h1>
              <p className="mt-1 text-sm text-[#64748b]">
                Geben Sie Ihre E-Mail-Adresse ein — wir senden Ihnen einen Link zum Zurücksetzen.
              </p>

              {error && (
                <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#1a1a2e]">E-Mail</label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
                    placeholder="name@firma.de"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#003856] px-4 py-3 font-medium text-white transition-all hover:bg-[#002a42] disabled:opacity-60"
                >
                  {loading && <Spinner className="h-4 w-4 text-white" />}
                  {loading ? "Wird gesendet …" : "Link senden"}
                </button>
              </form>
            </>
          )}
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

        {!sent && (
          <p className="mt-6 text-center text-sm text-[#64748b]">
            Passwort wieder eingefallen?{" "}
            <Link href="/login" className="font-medium text-[#003856] hover:underline">
              Zum Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
