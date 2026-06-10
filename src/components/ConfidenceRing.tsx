"use client";

import { useEffect, useState } from "react";
import { TIER_COLOR, type ConfidenceResult } from "@/lib/confidence";

/** Animierter SVG-Konfidenz-Ring mit hochzählender Prozentzahl. */
export default function ConfidenceRing({
  result,
  size = 132,
}: {
  result: ConfidenceResult;
  size?: number;
}) {
  const { score, tier, label } = result;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const color = TIER_COLOR[tier];

  const [progress, setProgress] = useState(0); // 0..1 für stroke + Zahl

  useEffect(() => {
    let raf = 0;
    let start: number | null = null;
    const dur = 700;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const shown = Math.round(score * progress);
  const offset = circ * (1 - (score / 100) * progress);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,56,86,0.08)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums" style={{ color }}>
            {shown}%
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#64748b]">KI-Konfidenz</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium" style={{ color }}>
        {label}
      </p>
    </div>
  );
}
