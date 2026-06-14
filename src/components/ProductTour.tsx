"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { isDemo } from "@/lib/api-client";

interface Step {
  sel: string | null;
  title: string;
  text: string;
  final?: boolean;
}

const STEPS: Step[] = [
  { sel: '[data-tour="kpis"]', title: "Willkommen bei FlowCheck AI+! 👋", text: "Hier sehen Sie Ihre Rechnungsübersicht auf einen Blick." },
  { sel: '[data-tour="nav-/upload"]', title: "Rechnungen hochladen", text: "Laden Sie Ihre erste Rechnung als PDF oder XML hoch — die KI analysiert sie in wenigen Sekunden." },
  { sel: '[data-tour="nav-/review"]', title: "Review-Modus", text: "Prüfen und freigeben Sie Rechnungen in Rekordzeit — mit Keyboard-Shortcuts!" },
  { sel: '[data-tour="nav-/export"]', title: "DATEV-Export", text: "Exportieren Sie freigegebene Rechnungen als DATEV-Buchungsstapel. Ein Klick — fertig." },
  { sel: null, title: "Sie sind bereit! 🎉", text: "Laden Sie jetzt Ihre erste Rechnung hoch.", final: true },
];

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function ProductTour() {
  const pathname = usePathname();
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [box, setBox] = useState<Box | null>(null);

  // Start: nur beim ersten Login, auf dem Dashboard, Desktop, kein Demo.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("fc_toured")) return;
    if (isDemo()) return;
    if (window.innerWidth < 768) return;
    if (pathname !== "/dashboard") return;
    const t = window.setTimeout(() => setActive(true), 1200);
    return () => window.clearTimeout(t);
  }, [pathname]);

  // Position des hervorgehobenen Elements ermitteln.
  useEffect(() => {
    if (!active) return;
    const update = () => {
      const sel = STEPS[step].sel;
      if (!sel) {
        setBox(null);
        return;
      }
      const el = document.querySelector(sel);
      if (!el) {
        setBox(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    const raf = requestAnimationFrame(update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [active, step]);

  const finish = () => {
    if (typeof window !== "undefined") localStorage.setItem("fc_toured", "true");
    setActive(false);
  };

  if (!active) return null;

  const s = STEPS[step];
  const pad = 8;
  // Tooltip-Position: unter dem Element bzw. zentriert beim Finale.
  const tooltipStyle: React.CSSProperties =
    box && !s.final
      ? {
          top: Math.min(box.top + box.height + 16, (typeof window !== "undefined" ? window.innerHeight : 800) - 220),
          left: Math.max(16, Math.min(box.left, (typeof window !== "undefined" ? window.innerWidth : 1200) - 360)),
        }
      : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

  return (
    <div className="fixed inset-0 z-[150]">
      {/* Spotlight */}
      {box ? (
        <div
          className="pointer-events-none absolute rounded-xl ring-2 ring-[#ffb900] transition-all duration-200"
          style={{
            top: box.top - pad,
            left: box.left - pad,
            width: box.width + pad * 2,
            height: box.height + pad * 2,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
      )}

      {/* Tooltip */}
      <div className="fc-scale-in absolute w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-6 shadow-2xl" style={tooltipStyle}>
        <p className="text-base font-semibold text-[#1a1a2e]">{s.title}</p>
        <p className="mt-2 text-sm text-[#64748b]">{s.text}</p>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === step ? "bg-[#003856]" : "bg-[#cbd5e1]"}`} />
            ))}
          </div>
          <span className="text-xs text-[#94a3b8]">
            {step + 1} von {STEPS.length}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          {!s.final ? (
            <button onClick={finish} className="text-xs font-medium text-[#94a3b8] transition hover:text-[#64748b]">
              Tour überspringen
            </button>
          ) : (
            <span />
          )}
          {s.final ? (
            <div className="flex gap-2">
              <button
                onClick={finish}
                className="rounded-xl px-4 py-2 text-sm font-medium text-[#64748b] transition hover:bg-[#faf9f7] active:scale-95"
              >
                Dashboard ansehen
              </button>
              <button
                onClick={() => {
                  finish();
                  router.push("/upload");
                }}
                className="rounded-xl bg-[#003856] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#002a42] active:scale-95"
              >
                Erste Rechnung hochladen →
              </button>
            </div>
          ) : (
            <button
              onClick={() => setStep((p) => Math.min(STEPS.length - 1, p + 1))}
              className="rounded-xl bg-[#003856] px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[#002a42] active:scale-95"
            >
              Weiter →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
