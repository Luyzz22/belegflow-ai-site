import { Check, X } from "lucide-react";

/** Stilisiertes Browser-Fenster mit Mini-Review-Mode (reines HTML/SVG, kein Bild). */
export default function HeroMockup() {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const pct = 97;
  return (
    <div className="fc-float w-full max-w-md rounded-2xl border border-[rgba(0,56,86,0.1)] bg-white shadow-2xl">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-[rgba(0,56,86,0.08)] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
        <div className="ml-3 flex-1 rounded-md bg-[#f8f6f3] px-3 py-1 text-center text-[11px] text-[#94a3b8]">
          belegflow-ai.de/review
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1a1a2e]">Müller &amp; Brandt GmbH</p>
            <p className="text-xs text-[#64748b]">RE-2026-001 · 7.931,35 €</p>
          </div>
          {/* Confidence Ring */}
          <div className="relative h-[88px] w-[88px]">
            <svg width="88" height="88" className="-rotate-90">
              <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(0,56,86,0.08)" strokeWidth="8" />
              <circle
                cx="44"
                cy="44"
                r={r}
                fill="none"
                stroke="#059669"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - pct / 100)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-emerald-600">{pct}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          {["§14 Pflichtangaben", "IBAN gültig", "Betragscheck", "Kontierung 4400 → 1200"].map((l) => (
            <div key={l} className="flex items-center gap-2 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-700">
              <Check className="h-3.5 w-3.5" />
              {l}
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <div className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 py-2 text-xs font-medium text-red-600">
            <X className="h-4 w-4" /> Ablehnen
          </div>
          <div className="flex flex-[1.4] items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white">
            <Check className="h-4 w-4" /> Freigeben
          </div>
        </div>
      </div>
    </div>
  );
}
