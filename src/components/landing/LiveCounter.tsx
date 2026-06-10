"use client";

import { useEffect, useState } from "react";
import CountUp from "@/components/CountUp";

/** Live-Zähler verarbeiteter Rechnungen. Der KPI-Endpoint erfordert Auth —
 *  für anonyme Besucher (401) rendert die Komponente null (keine Fake-Zahlen). */
export default function LiveCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/app/dashboard/kpis")
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((data: { rechnungen_quartal?: number; rechnungen_monat?: number }) => {
        if (cancelled) return;
        const n = data.rechnungen_quartal ?? data.rechnungen_monat ?? 0;
        if (n > 0) setCount(n);
      })
      .catch(() => {
        /* anonym oder offline → nichts anzeigen */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null) return null;

  return (
    <div className="fc-fade-in mt-8 inline-flex items-center gap-2.5 rounded-full border border-[rgba(0,56,86,0.08)] bg-white px-4 py-2 text-sm shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </span>
      <span className="font-semibold text-[#1a1a2e]">
        <CountUp value={count} />
      </span>
      <span className="text-[#64748b]">Rechnungen verarbeitet</span>
    </div>
  );
}
