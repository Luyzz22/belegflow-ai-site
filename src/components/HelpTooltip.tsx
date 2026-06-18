"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";

// Kleines „?"-Icon mit Tooltip bei Hover/Fokus/Klick.
export default function HelpTooltip({ text, className = "" }: { text: string; className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className={`relative inline-flex align-middle ${className}`}>
      <button
        type="button"
        aria-label="Hilfe"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="text-stone-400 transition hover:text-[#003856]"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-6 z-50 w-60 -translate-x-1/2 rounded-xl border border-[rgba(0,56,86,0.12)] bg-white p-3 text-left text-xs font-normal leading-relaxed text-[#64748b] shadow-[0_8px_30px_rgba(0,56,86,0.16)]"
        >
          {text}
        </span>
      )}
    </span>
  );
}
