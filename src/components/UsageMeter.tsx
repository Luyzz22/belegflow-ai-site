"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { resolveEntitlement } from "@/lib/entitlement";
import { getUsage, type Usage } from "@/lib/usage";

const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-5 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";

export default function UsageMeter() {
  const { user, entitlement } = useAuth();
  const ent = resolveEntitlement({ user, entitlement });

  // Fallback nur, wenn das Backend KEIN Entitlement liefert (localStorage).
  const [fallback, setFallback] = useState<Usage | null>(null);
  useEffect(() => {
    if (entitlement || ent.unlimited) return;
    Promise.resolve().then(() => setFallback(getUsage()));
  }, [entitlement, ent.unlimited]);

  // Unbegrenzt / Admin: niemals gaten, nie eine Paywall.
  if (ent.unlimited) {
    return (
      <div className={`${CARD} mb-6 flex items-center justify-between gap-3`}>
        <span className="text-sm font-medium text-[#1a1a2e]">
          {ent.used != null ? `${ent.used} Rechnungen diesen Monat` : "Rechnungsverarbeitung"}
        </span>
        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Unbegrenzt</span>
      </div>
    );
  }

  // Entitlement mit echtem numerischem Limit vom Backend.
  if (entitlement && ent.limit != null) {
    return <Meter used={ent.used ?? 0} limit={ent.limit} blocked={ent.blocked} message={ent.message} />;
  }

  // Fallback (kein Entitlement): localStorage-Nutzung.
  if (!fallback) return null;
  if (fallback.limit === null) {
    return (
      <div className={`${CARD} mb-6 flex items-center justify-between gap-3`}>
        <span className="text-sm font-medium text-[#1a1a2e]">{fallback.count} Rechnungen diesen Monat</span>
        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Unbegrenzt</span>
      </div>
    );
  }
  return <Meter used={fallback.count} limit={fallback.limit} blocked={false} message={null} />;
}

function Meter({ used, limit, blocked, message }: { used: number; limit: number; blocked: boolean; message: string | null }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const color = blocked || pct >= 95 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-[#003856]";
  return (
    <div className={`${CARD} mb-6`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[#1a1a2e]">
          {used} / {limit} Rechnungen diesen Monat
        </span>
        {(blocked || pct >= 80) && (
          <Link href="/einstellungen?tab=abo" className="text-xs font-semibold text-[#003856] hover:underline">
            Plan upgraden →
          </Link>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {blocked && (
        <p className="mt-2 text-xs font-medium text-red-600">{message || "Monatliches Kontingent erreicht."}</p>
      )}
    </div>
  );
}
