"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { CloudUpload, CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { BrandLink } from "@/components/Brand";

export default function PortalPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token ?? "";

  const [file, setFile] = useState<File | null>(null);
  const [rechnungsnummer, setRechnungsnummer] = useState("");
  const [betrag, setBetrag] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const INPUT =
    "w-full rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Bitte laden Sie eine Rechnungsdatei hoch.");
      return;
    }
    if (!rechnungsnummer || !betrag || !email) {
      setError("Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }
    // MVP: Frontend-only — Einreichung wird simuliert (Portal-Backend folgt).
    setError(null);
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f6f3]">
      <header className="flex h-16 items-center justify-between border-b border-[rgba(0,56,86,0.08)] bg-white px-6">
        <BrandLink />
        <span className="text-sm text-[#64748b]">Lieferanten-Portal</span>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          {submitted ? (
            <div className="rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h1 className="text-xl font-semibold text-[#1a1a2e]">Danke!</h1>
              <p className="mt-2 text-sm text-[#64748b]">
                Ihre Rechnung wird automatisch verarbeitet. Sie erhalten eine Bestätigung an{" "}
                <span className="font-medium text-[#1a1a2e]">{email}</span>.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-8 shadow-sm">
              <h1 className="text-2xl font-semibold tracking-tight text-[#003856]">Rechnung einreichen</h1>
              <p className="mt-1 text-sm text-[#64748b]">Laden Sie Ihre Rechnung hoch — wir verarbeiten sie automatisch.</p>

              {error && (
                <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
              )}

              <form onSubmit={submit} className="mt-6 space-y-4">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[rgba(0,56,86,0.2)] bg-[#faf9f7] p-8 text-center transition hover:border-[#003856]/40">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.xml"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  {file ? (
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-[#1a1a2e]">
                      <FileText className="h-5 w-5 text-[#003856]" />
                      {file.name}
                    </span>
                  ) : (
                    <>
                      <CloudUpload className="mb-2 h-8 w-8 text-[#003856]" />
                      <span className="text-sm font-medium text-[#1a1a2e]">Rechnung als PDF oder XML hochladen</span>
                      <span className="mt-1 text-xs text-[#64748b]">PDF, JPEG, PNG, XML (XRechnung/ZUGFeRD)</span>
                    </>
                  )}
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input value={rechnungsnummer} onChange={(e) => setRechnungsnummer(e.target.value)} placeholder="Rechnungsnummer *" className={INPUT} />
                  <input value={betrag} onChange={(e) => setBetrag(e.target.value)} placeholder="Betrag (€) *" className={INPUT} />
                </div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ihre E-Mail (für Bestätigung) *" className={INPUT} />

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#003856] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95"
                >
                  Einreichen
                </button>
              </form>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#94a3b8]">
                <ShieldCheck className="h-3.5 w-3.5" /> Sichere Übermittlung · Portal-ID {token.slice(0, 8)}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
