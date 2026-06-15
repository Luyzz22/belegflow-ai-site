"use client";

import { Printer } from "lucide-react";

export default function PrintButton({ label = "Als PDF herunterladen" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2 text-xs font-medium text-[#003856] transition hover:bg-[#faf9f7] active:scale-95 print:hidden"
    >
      <Printer className="h-4 w-4" />
      {label}
    </button>
  );
}
