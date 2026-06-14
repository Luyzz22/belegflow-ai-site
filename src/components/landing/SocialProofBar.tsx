"use client";

import { useEffect, useState } from "react";

interface Stats {
  rechnungen: string;
  lieferanten: string;
  automatisierung: string;
}

// Fallback für anonyme Besucher (klar als Richtwerte gehalten).
const FALLBACK: Stats = { rechnungen: "12.000+", lieferanten: "800+", automatisierung: "89%" };

export default function SocialProofBar() {
  const [stats, setStats] = useState<Stats>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/app/dashboard/kpis").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/app/lieferanten").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([kpis, lief]) => {
      if (cancelled || !kpis) return;
      setStats({
        rechnungen: new Intl.NumberFormat("de-DE").format(kpis.rechnungen_quartal ?? kpis.rechnungen_monat ?? 0),
        lieferanten: lief?.items ? String(lief.items.length) : FALLBACK.lieferanten,
        automatisierung: `${Math.round(kpis.automatisierungsquote ?? 0)}%`,
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="border-b border-[rgba(0,56,86,0.08)] bg-[#faf9f7]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 py-4 text-center text-sm text-[#64748b]">
        <span>
          <span className="font-bold text-[#003856]">{stats.rechnungen}</span> Rechnungen verarbeitet
        </span>
        <span className="hidden sm:inline text-[#cbd5e1]">·</span>
        <span>
          <span className="font-bold text-[#003856]">{stats.lieferanten}</span> Lieferanten erkannt
        </span>
        <span className="hidden sm:inline text-[#cbd5e1]">·</span>
        <span>
          <span className="font-bold text-[#003856]">{stats.automatisierung}</span> Automatisierung
        </span>
      </div>
    </div>
  );
}
