"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

/** Toast-Notification, slide-in von rechts. Auto-Dismiss nach `duration` ms. */
export default function Toast({
  type,
  text,
  onClose,
  duration = 3500,
}: {
  type: "success" | "error";
  text: string;
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div
      role="status"
      className={`fc-toast fixed right-4 top-4 z-[100] flex max-w-sm items-start gap-3 rounded-2xl border bg-white px-4 py-3.5 shadow-[0_8px_30px_rgba(0,56,86,0.16)] ${
        type === "success" ? "border-emerald-200" : "border-red-200"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
      ) : (
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
      )}
      {/* Laufzeit-Guard: nie ein Objekt als React-Child rendern (React #31). */}
      <p className="text-sm font-medium text-[#1a1a2e]">
        {typeof text === "string" ? text : "Unbekannter Fehler"}
      </p>
      <button
        onClick={onClose}
        aria-label="Schließen"
        className="ml-1 shrink-0 rounded-lg p-0.5 text-[#64748b] transition hover:bg-[#faf9f7] hover:text-[#1a1a2e]"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
