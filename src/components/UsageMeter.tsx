"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUsage, type Usage } from "@/lib/usage";

export default function UsageMeter() {
  const [u, setU] = useState<Usage | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => setU(getUsage()));
  }, []);

  if (!u) return null;

  const card = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-5 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";

  if (u.limit === null) {
    return (
      <div className={`${card} mb-6 flex items-center justify-between gap-3`}>
        <span className="text-sm font-medium text-[#1a1a2e]">
          {u.count} Rechnungen diesen Monat
        </span>
        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Unbegrenzt</span>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((u.count / u.limit) * 100));
  const color = pct >= 95 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-[#003856]";

  return (
    <div className={`${card} mb-6`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[#1a1a2e]">
          {u.count} / {u.limit} Rechnungen diesen Monat
        </span>
        {pct >= 80 && (
          <Link href="/einstellungen?tab=abo" className="text-xs font-semibold text-[#003856] hover:underline">
            Plan upgraden →
          </Link>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
