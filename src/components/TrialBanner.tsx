"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { resolveEntitlement } from "@/lib/entitlement";
import { trialDaysLeft } from "@/lib/subscription";

export default function TrialBanner() {
  const { user, entitlement } = useAuth();
  const ent = resolveEntitlement({ user, entitlement });

  const [days, setDays] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    Promise.resolve().then(() => {
      // Trial-Tage nur als Fallback, wenn KEIN Entitlement vorliegt.
      setDays(entitlement ? null : trialDaysLeft());
      setDismissed(sessionStorage.getItem("fc_trial_banner_dismissed") === "1");
    });
  }, [entitlement]);

  // Unbegrenzt/Admin: niemals ein Trial-/Paywall-Banner.
  if (ent.unlimited) return null;

  const dismiss = () => {
    sessionStorage.setItem("fc_trial_banner_dismissed", "1");
    setDismissed(true);
  };

  // 1) Entitlement vorhanden → Banner NUR bei tatsächlich erreichtem Limit (allowed === false).
  if (entitlement) {
    if (!ent.blocked) return null;
    return (
      <Banner
        icon={<Clock className="h-4 w-4 shrink-0 text-red-600" />}
        text={ent.message || "Ihr monatliches Kontingent ist aufgebraucht."}
        onDismiss={dismiss}
        dismissed={dismissed}
        tone="red"
      />
    );
  }

  // 2) Kein Entitlement → alter Trial-Tage-Fallback.
  if (days === null || dismissed) return null;
  return (
    <Banner
      icon={<Clock className="h-4 w-4 shrink-0 text-[#003856]" />}
      text={days > 0 ? `Ihre Testphase endet in ${days} ${days === 1 ? "Tag" : "Tagen"}.` : "Ihre Testphase ist beendet."}
      onDismiss={dismiss}
      dismissed={dismissed}
      tone="blue"
    />
  );
}

function Banner({
  icon,
  text,
  onDismiss,
  dismissed,
  tone,
}: {
  icon: React.ReactNode;
  text: string;
  onDismiss: () => void;
  dismissed: boolean;
  tone: "blue" | "red";
}) {
  if (dismissed) return null;
  const cls = tone === "red" ? "border-red-200 bg-red-50" : "border-[#003856]/15 bg-[#003856]/5";
  return (
    <div className={`mb-4 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-sm print:hidden ${cls}`}>
      {icon}
      <span className="font-medium text-[#1a1a2e]">{text}</span>
      <Link href="/einstellungen?tab=abo" className="inline-flex items-center gap-1 font-semibold text-[#003856] hover:underline">
        Plan auswählen <ArrowRight className="h-3.5 w-3.5" />
      </Link>
      <button onClick={onDismiss} aria-label="Hinweis schließen" className="ml-auto rounded-lg p-1 text-[#64748b] transition hover:bg-[#003856]/5 hover:text-[#1a1a2e]">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
