"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles, Check, ArrowRight } from "lucide-react";
import HeroMockup from "@/components/landing/HeroMockup";
import TiltCard from "@/components/landing/TiltCard";
import TryFreeCta from "@/components/landing/TryFreeCta";

function useCountUp(target: number, decimals = 0, duration = 1400) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      Promise.resolve().then(() => setVal(target));
      return;
    }
    let raf = 0;
    let startTs = 0;
    const step = (ts: number) => {
      if (!startTs) startTs = ts;
      const p = Math.min(1, (ts - startTs) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val.toLocaleString("de-DE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-[rgba(0,56,86,0.1)] bg-white/70 px-3.5 py-2 backdrop-blur">
      <p className="text-lg font-bold tabular-nums text-[#003856]">{value}</p>
      <p className="text-[11px] font-medium uppercase tracking-wider text-[#64748b]">{label}</p>
    </div>
  );
}

export default function InteractiveHero() {
  const speed = useCountUp(45);
  const accuracy = useCountUp(99.7, 1);
  const saving = useCountUp(5700);

  return (
    <section className="relative overflow-hidden border-b border-[rgba(0,56,86,0.08)] bg-[#f8f6f3]">
      {/* Aurora background — brand navy/gold, no generic AI gradient */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="fc-aurora absolute -left-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-[#003856]/20 blur-3xl" />
        <div className="fc-aurora-slow absolute -right-24 top-10 h-[28rem] w-[28rem] rounded-full bg-[#c8985a]/20 blur-3xl" />
        <div className="fc-aurora absolute bottom-[-12rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-[#0a4d70]/15 blur-3xl" />
        {/* dotted grid */}
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage: "radial-gradient(rgba(0,56,86,0.07) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 35%, #000 40%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 35%, #000 40%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[56%_44%]">
        {/* Left: copy */}
        <div>
          <span className="fc-fade-in inline-flex items-center gap-2 rounded-full border border-[rgba(0,56,86,0.12)] bg-white/70 px-3 py-1 text-xs font-semibold text-[#003856] backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-[#c8985a]" />
            KI-native Rechnungsverarbeitung
          </span>
          <h1 className="fc-rise mt-5 text-balance text-4xl font-bold leading-[1.08] tracking-tight text-[#1a1a2e] sm:text-5xl lg:text-6xl">
            Rechnungen in Sekunden
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">statt in Minuten.</span>
              <span aria-hidden className="absolute inset-x-0 bottom-1 z-0 h-3 bg-[#FFB900]/40" />
            </span>
          </h1>
          <p className="fc-rise mt-6 max-w-xl text-base text-[#475569] sm:text-lg">
            FlowCheck AI+ prüft, validiert und kontiert Ihre Eingangsrechnungen automatisch — DATEV-ready,
            DSGVO-konform, gehostet in Deutschland.
          </p>

          <div className="fc-rise mt-8 flex flex-wrap items-center gap-4">
            <TryFreeCta />
            <Link href="/e-rechnung-pruefen" className="inline-flex items-center gap-1.5 font-medium text-[#003856] underline-offset-4 hover:underline">
              E-Rechnung kostenlos prüfen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Live stat pills (count-up) */}
          <div className="fc-rise mt-8 flex flex-wrap gap-3">
            <StatPill value={`${speed} Sek`} label="pro Rechnung" />
            <StatPill value={`${accuracy} %`} label="Genauigkeit" />
            <StatPill value={`${saving} €`} label="Ersparnis / Jahr" />
          </div>

          <p className="fc-fade-in mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#64748b]">
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-600" /> Keine Kreditkarte</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-600" /> 14 Tage kostenlos</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-600" /> DSGVO-konform</span>
          </p>
        </div>

        {/* Right: tilt mockup with floating chips */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative">
            <TiltCard max={9} className="rounded-2xl">
              <HeroMockup />
            </TiltCard>

            {/* Floating depth chips */}
            <div className="fc-floaty absolute -left-6 top-10 hidden rounded-xl border border-[rgba(0,56,86,0.1)] bg-white px-3 py-2 shadow-lg sm:block">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <Check className="h-3.5 w-3.5" /> §14 geprüft
              </p>
            </div>
            <div className="fc-floaty-2 absolute -right-4 bottom-16 hidden rounded-xl border border-[rgba(0,56,86,0.1)] bg-white px-3 py-2 shadow-lg sm:block">
              <p className="text-xs font-semibold text-[#003856]">DATEV-Export <span className="text-[#c8985a]">1 Klick</span></p>
            </div>
            <div className="fc-floaty absolute -bottom-5 left-10 hidden rounded-xl border border-[rgba(0,56,86,0.1)] bg-[#003856] px-3 py-2 shadow-lg md:block">
              <p className="text-xs font-semibold text-white">KI-Konfidenz <span className="text-[#FFB900]">97 %</span></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
