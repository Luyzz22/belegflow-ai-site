"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Sparkles, CheckCircle2, Check, FileText, ShieldCheck, Landmark } from "lucide-react";

const STEPS = [
  {
    num: "1",
    icon: Upload,
    title: "Rechnung hochladen",
    desc: "PDF, Scan oder E-Rechnung (XRechnung/ZUGFeRD) — einzeln oder im Stapel. Per Drag-and-drop, E-Mail-Eingang oder Lieferanten-Portal.",
  },
  {
    num: "2",
    icon: Sparkles,
    title: "KI prüft in Sekunden",
    desc: "Felder werden extrahiert, §14-Pflichtangaben und IBAN validiert, Duplikate erkannt und die Kontierung (SKR03/04) vorgeschlagen.",
  },
  {
    num: "3",
    icon: CheckCircle2,
    title: "Freigeben & exportieren",
    desc: "Mehrstufig genehmigen und als DATEV-Buchungsstapel exportieren — revisionssicher protokolliert.",
  },
];

function Layer({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <div
      className="absolute inset-0 transition-all duration-500"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0) scale(1)" : "translateY(12px) scale(0.98)",
        pointerEvents: show ? "auto" : "none",
      }}
      aria-hidden={!show}
    >
      {children}
    </div>
  );
}

/* Sticky-Visual je Schritt (Crossfade, nur transform/opacity) */
function StepVisual({ active }: { active: number }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative h-[320px] w-full max-w-sm">
      {/* Schritt 1 — Upload */}
      <Layer show={active === 0}>
        <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#003856]/25 bg-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#003856]/10 text-[#003856]">
            <Upload className="h-8 w-8" />
          </div>
          <p className="mt-4 text-sm font-semibold text-[#1a1a2e]">Rechnung hierher ziehen</p>
          <p className="mt-1 text-xs text-[#64748b]">PDF · XRechnung · ZUGFeRD · bis 10 MB</p>
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-[rgba(0,56,86,0.1)] bg-[#faf9f7] px-3 py-2 text-xs text-[#1a1a2e]">
            <FileText className="h-4 w-4 text-[#c8985a]" /> RE-2026-001.pdf
          </div>
        </div>
      </Layer>

      {/* Schritt 2 — KI prüft */}
      <Layer show={active === 1}>
        <div className="flex h-full flex-col justify-center rounded-2xl border border-[rgba(0,56,86,0.1)] bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1a1a2e]">Müller &amp; Brandt GmbH</p>
              <p className="text-xs text-[#64748b]">RE-2026-001 · 7.931,35 €</p>
            </div>
            <div className="relative h-[80px] w-[80px]">
              <svg width="80" height="80" className="-rotate-90">
                <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(0,56,86,0.08)" strokeWidth="7" />
                <circle cx="40" cy="40" r={r} fill="none" stroke="#059669" strokeWidth="7" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - 0.97)} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-emerald-600">97%</div>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            {["§14 Pflichtangaben", "IBAN gültig", "Kontierung 4400 → 1200"].map((l) => (
              <div key={l} className="flex items-center gap-2 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-700">
                <Check className="h-3.5 w-3.5" /> {l}
              </div>
            ))}
          </div>
        </div>
      </Layer>

      {/* Schritt 3 — Freigeben & Export */}
      <Layer show={active === 2}>
        <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-[rgba(0,56,86,0.1)] bg-white p-6 shadow-lg">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <p className="mt-4 text-sm font-semibold text-[#1a1a2e]">Freigegeben</p>
          <p className="mt-1 text-xs text-[#64748b]">2-Augen-Prinzip · revisionssicher</p>
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#003856] px-4 py-2.5 text-xs font-semibold text-white">
            <Landmark className="h-4 w-4 text-[#FFB900]" /> DATEV-Buchungsstapel exportiert
          </div>
        </div>
      </Layer>
    </div>
  );
}

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActive(Number((e.target as HTMLElement).dataset.idx));
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    refs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section className="border-y border-[rgba(0,56,86,0.08)] bg-[#faf9f7] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#c8985a]">Ablauf</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1a1a2e]">In drei Schritten zur Automatisierung</h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Sticky-Visual (Desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-28 flex justify-center">
              <StepVisual active={active} />
            </div>
          </div>

          {/* Schritte */}
          <ol className="space-y-6 lg:space-y-[26vh]">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const on = active === i;
              return (
                <li
                  key={s.num}
                  data-idx={i}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                >
                  {/* Kompaktes Visual auf Mobile (kein Sticky) */}
                  <div className="relative mb-4 h-[240px] lg:hidden">
                    <StepVisual active={i} />
                  </div>
                  <div
                    className={`rounded-2xl border bg-white p-6 transition-all duration-300 ${
                      on ? "border-[#003856]/30 shadow-lg lg:scale-[1.02]" : "border-[rgba(0,56,86,0.08)] shadow-sm lg:opacity-55"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                          on ? "bg-[#003856] text-white" : "bg-[#003856]/10 text-[#003856]"
                        }`}
                      >
                        {s.num}
                      </span>
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-[#1a1a2e]">
                        <Icon className="h-5 w-5 text-[#c8985a]" /> {s.title}
                      </h3>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-[#64748b]">{s.desc}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
