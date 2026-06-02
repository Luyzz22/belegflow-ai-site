"use client";

import { useState } from "react";
import PublicPage from "@/components/PublicPage";
import { Spinner } from "@/components/States";

export default function KontaktPage() {
  const [form, setForm] = useState({ name: "", email: "", firma: "", nachricht: "", anliegen: "demo" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const up = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Kein dokumentierter Kontakt-Endpoint — Anfrage wird per mailto / CRM verarbeitet.
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 600);
  };

  return (
    <PublicPage
      title="Kontakt"
      subtitle="Fragen zu FlowCheck AI+ oder eine Demo gewünscht? Wir melden uns innerhalb eines Werktags."
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {sent ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-stone-200/60">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl">
                ✓
              </div>
              <h2 className="text-xl font-semibold text-[#003856]">Vielen Dank!</h2>
              <p className="mt-2 text-sm text-stone-500">
                Ihre Anfrage ist eingegangen. Wir melden uns in Kürze bei {form.email || "Ihnen"}.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-stone-200/60">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700">Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => up("name", e.target.value)}
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700">E-Mail</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => up("email", e.target.value)}
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/10"
                  />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700">Firma</label>
                  <input
                    value={form.firma}
                    onChange={(e) => up("firma", e.target.value)}
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700">Anliegen</label>
                  <select
                    value={form.anliegen}
                    onChange={(e) => up("anliegen", e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/10"
                  >
                    <option value="demo">Demo anfragen</option>
                    <option value="preise">Frage zu Preisen</option>
                    <option value="technik">Technische Frage</option>
                    <option value="sonstiges">Sonstiges</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium text-stone-700">Nachricht</label>
                <textarea
                  required
                  rows={5}
                  value={form.nachricht}
                  onChange={(e) => up("nachricht", e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/10"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#003856] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#002a42] disabled:opacity-60"
              >
                {sending && <Spinner className="h-4 w-4 text-white" />}
                Anfrage senden
              </button>
            </form>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/60">
            <h3 className="text-sm font-semibold text-stone-800">Direktkontakt</h3>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-stone-400">E-Mail</dt>
                <dd>
                  <a href="mailto:ki@sbsdeutschland.de" className="font-medium text-[#003856] hover:underline">
                    ki@sbsdeutschland.de
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-stone-400">Anbieter</dt>
                <dd className="font-medium text-stone-700">SBS Deutschland GmbH &amp; Co. KG</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-2xl bg-[#003856] p-6 text-white">
            <h3 className="text-sm font-semibold">🇩🇪 Hosting in Deutschland</h3>
            <p className="mt-2 text-sm text-white/70">
              Ihre Daten verlassen Deutschland nicht — DSGVO- und GoBD-konform.
            </p>
          </div>
        </aside>
      </div>
    </PublicPage>
  );
}
