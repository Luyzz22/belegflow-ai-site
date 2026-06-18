"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { PLANS, getPlan, planById, setPlan, trialDaysLeft, type PlanId } from "@/lib/subscription";
import { useToast } from "@/components/toast/ToastProvider";

const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";

export default function SubscriptionPanel() {
  const { addToast } = useToast();
  const [plan, setPlanState] = useState<PlanId>("starter");
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      setPlanState(getPlan());
      setDaysLeft(trialDaysLeft());
    });
  }, []);

  const choose = (id: PlanId) => {
    setPlan(id);
    setPlanState(id);
    addToast({ type: "info", text: "Stripe-Integration wird aktiviert, sobald die Zahlungsanbindung live ist." });
  };

  const current = planById(plan);

  return (
    <div className="space-y-6">
      {/* Aktueller Status */}
      <section className={CARD}>
        <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Ihr Abonnement</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-[#faf9f7] p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-[#64748b]">Aktueller Plan</p>
            <p className="mt-1 text-lg font-bold text-[#1a1a2e]">Kostenlos (Testphase)</p>
            <p className="text-xs text-[#94a3b8]">Umfang: {current.name}</p>
          </div>
          <div className="rounded-xl bg-[#faf9f7] p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-[#64748b]">Verbleibend</p>
            <p className="mt-1 text-lg font-bold text-[#1a1a2e]">{daysLeft === null ? "—" : `${daysLeft} Tage`}</p>
            <p className="text-xs text-[#94a3b8]">der 14-tägigen Testphase</p>
          </div>
          <div className="rounded-xl bg-[#faf9f7] p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-[#64748b]">Monatslimit</p>
            <p className="mt-1 text-lg font-bold text-[#1a1a2e]">{current.limit === null ? "Unbegrenzt" : `${current.limit} Rechnungen`}</p>
          </div>
        </div>
      </section>

      {/* Plan-Vergleich */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Plan auswählen</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {PLANS.map((p) => {
            const active = p.id === plan;
            return (
              <div
                key={p.id}
                className={`relative rounded-2xl border bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)] ${
                  p.recommended ? "border-[#003856] ring-1 ring-[#003856]/20" : "border-[rgba(0,56,86,0.08)]"
                }`}
              >
                {p.recommended && (
                  <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-[#003856] px-3 py-1 text-xs font-semibold text-white">
                    <Sparkles className="h-3 w-3" /> Empfohlen
                  </span>
                )}
                <h3 className="text-lg font-semibold text-[#1a1a2e]">{p.name}</h3>
                <p className="mt-1">
                  <span className="text-3xl font-bold text-[#003856]">{p.price} €</span>
                  <span className="text-sm text-[#64748b]"> / Monat</span>
                </p>
                <ul className="mt-4 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#64748b]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => choose(p.id)}
                  disabled={active}
                  className={`mt-5 w-full rounded-xl px-5 py-2.5 text-sm font-medium transition-all active:scale-95 ${
                    active
                      ? "cursor-default border border-[rgba(0,56,86,0.12)] text-[#64748b]"
                      : "bg-[#003856] text-white hover:bg-[#002a42]"
                  }`}
                >
                  {active ? "Aktueller Umfang" : "Jetzt starten"}
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-[#94a3b8]">
          Enterprise individuell?{" "}
          <a href="mailto:ki@sbsdeutschland.de" className="font-medium text-[#003856] hover:underline">Kontakt aufnehmen</a>
        </p>
      </section>
    </div>
  );
}
