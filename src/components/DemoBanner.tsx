"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { isDemo, setDemoMode } from "@/lib/api-client";

/** Aktiviert den Demo-Modus bei ?demo=true und zeigt einen Hinweis-Banner. */
export default function DemoBanner() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "true" && !isDemo()) {
      setDemoMode(true);
      window.location.reload(); // alle Datenabrufe im Demo-Modus neu laden
      return;
    }
    const on = isDemo();
    Promise.resolve().then(() => setActive(on));
  }, []);

  if (!active) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 print:hidden">
      <span className="inline-flex items-center gap-2 font-medium">
        <Sparkles className="h-4 w-4" />
        Demo-Modus — Beispieldaten werden angezeigt
      </span>
      <button
        onClick={() => {
          setDemoMode(false);
          window.location.href = window.location.pathname;
        }}
        className="font-semibold underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-amber-500/40"
      >
        Live-Modus →
      </button>
    </div>
  );
}
