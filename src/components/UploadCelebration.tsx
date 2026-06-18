"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { PartyPopper, CheckCircle2 } from "lucide-react";

// Erfolgs-Modal nach dem ersten erfolgreichen Upload eines neuen Users.
export default function UploadCelebration({ fileName, onClose }: { fileName?: string; onClose: () => void }) {
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    ctaRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm print:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Erste Rechnung verarbeitet"
      onClick={onClose}
    >
      <div className="fc-pop w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#003856]/5 text-[#c8985a]">
          <PartyPopper className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-[#1a1a2e]">🎉 Ihre erste Rechnung wurde verarbeitet!</h2>
        {fileName && <p className="mt-1.5 truncate text-sm text-[#64748b]">{fileName}</p>}

        <div className="mt-5 space-y-2 rounded-xl bg-[#faf9f7] p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">FlowCheck hat automatisch:</p>
          {[
            "Rechnungsfelder extrahiert",
            "IBAN und USt-ID geprüft",
            "Kontierung vorgeschlagen",
          ].map((t) => (
            <p key={t} className="flex items-center gap-2 text-sm text-[#1a1a2e]">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> {t}
            </p>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            ref={ctaRef}
            href="/rechnungen"
            onClick={onClose}
            className="flex-1 rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95"
          >
            Rechnung ansehen →
          </Link>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-[rgba(0,56,86,0.12)] px-5 py-2.5 text-sm font-medium text-[#003856] transition hover:bg-[#faf9f7] active:scale-95"
          >
            Weitere hochladen
          </button>
        </div>
      </div>
    </div>
  );
}
