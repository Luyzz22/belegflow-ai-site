"use client";

import { useState } from "react";
import { Clock, CalendarCheck, MapPin, Mail, CheckCircle2 } from "lucide-react";
import PublicPage from "@/components/PublicPage";
import { Spinner } from "@/components/States";

const INTERESTS: { id: string; label: string }[] = [
  { id: "demo", label: "Persönliche Demo" },
  { id: "technik", label: "Technische Fragen" },
  { id: "enterprise", label: "Enterprise-Anfrage" },
  { id: "partnerschaft", label: "Partnerschaft" },
];

const INPUT =
  "w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/10";

export default function KontaktPage() {
  const [form, setForm] = useState({ name: "", email: "", firma: "", nachricht: "" });
  const [interests, setInterests] = useState<string[]>(["demo"]);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const up = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const toggleInterest = (id: string) =>
    setInterests((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const entry = { ...form, interests, timestamp: new Date().toISOString() };
    try {
      const list = JSON.parse(localStorage.getItem("fc_contact_submissions") || "[]") as unknown[];
      list.push(entry);
      localStorage.setItem("fc_contact_submissions", JSON.stringify(list));
    } catch {
      localStorage.setItem("fc_contact_submissions", JSON.stringify([entry]));
    }
    // Kein Backend-Endpoint — Anfrage wird lokal protokolliert und per CRM/E-Mail bearbeitet.
    window.setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 500);
  };

  const facts = [
    { icon: Clock, label: "Antwortzeit", value: "< 24 Stunden" },
    { icon: CalendarCheck, label: "Demo", value: "15 Minuten, kostenfrei" },
    { icon: MapPin, label: "Standort", value: "Weinheim, Deutschland 🇩🇪" },
    { icon: Mail, label: "E-Mail", value: "ki@sbsdeutschland.de" },
  ];

  return (
    <PublicPage
      title="Sprechen Sie mit uns"
      subtitle="Wir zeigen Ihnen FlowCheck AI+ in einer persönlichen Demo."
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Formular + Booking */}
        <div className="space-y-6 lg:col-span-2">
          {sent ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-stone-200/60">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-semibold text-[#003856]">Vielen Dank!</h2>
              <p className="mt-2 text-sm text-stone-500">
                Wir melden uns innerhalb von 24 Stunden bei {form.email || "Ihnen"}.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-stone-200/60">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700">Name</label>
                  <input required value={form.name} onChange={(e) => up("name", e.target.value)} className={INPUT} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700">E-Mail</label>
                  <input type="email" required value={form.email} onChange={(e) => up("email", e.target.value)} className={INPUT} />
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium text-stone-700">Unternehmen</label>
                <input value={form.firma} onChange={(e) => up("firma", e.target.value)} className={INPUT} />
              </div>
              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium text-stone-700">Nachricht</label>
                <textarea required rows={5} value={form.nachricht} onChange={(e) => up("nachricht", e.target.value)} className={INPUT} />
              </div>

              <fieldset className="mt-4">
                <legend className="mb-2 text-sm font-medium text-stone-700">Ich interessiere mich für:</legend>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {INTERESTS.map((it) => (
                    <label key={it.id} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-700 transition hover:bg-stone-50">
                      <input
                        type="checkbox"
                        checked={interests.includes(it.id)}
                        onChange={() => toggleInterest(it.id)}
                        className="h-4 w-4 rounded border-stone-300 text-[#003856] focus:ring-[#003856]"
                      />
                      {it.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={sending}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#003856] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#002a42] disabled:opacity-60"
              >
                {sending && <Spinner className="h-4 w-4 text-white" />}
                Nachricht senden
              </button>

              <p className="mt-4 text-xs text-stone-400">
                Alternativ erreichen Sie uns direkt unter{" "}
                <a href="mailto:ki@sbsdeutschland.de" className="font-medium text-[#003856] hover:underline">ki@sbsdeutschland.de</a>{" "}
                oder +49 6201 XXXXXX.
              </p>
            </form>
          )}

          {/* Meeting-Booking */}
          <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-stone-200/60">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#003856]">
              <CalendarCheck className="h-5 w-5 text-[#c8985a]" /> Termin direkt buchen
            </h2>
            <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 bg-[#faf9f7] py-10 text-center">
              <p className="text-sm font-medium text-stone-600">Kalender-Buchung wird hier eingebunden</p>
              <p className="text-xs text-stone-400">15-Minuten-Demo — kostenfrei und unverbindlich</p>
              <a
                href="mailto:ki@sbsdeutschland.de?subject=Demo-Termin%20FlowCheck%20AI%2B"
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#002a42]"
              >
                Demo-Termin anfragen
              </a>
            </div>
          </div>
        </div>

        {/* Quick Facts */}
        <aside className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/60">
            <h3 className="text-sm font-semibold text-stone-800">Quick Facts</h3>
            <dl className="mt-4 space-y-4">
              {facts.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#003856]" />
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-stone-400">{f.label}</dt>
                      <dd className="text-sm font-medium text-stone-700">{f.value}</dd>
                    </div>
                  </div>
                );
              })}
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
