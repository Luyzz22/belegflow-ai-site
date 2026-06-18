"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, X, ArrowRight } from "lucide-react";
import { trialDaysLeft } from "@/lib/subscription";

export default function TrialBanner() {
  const [days, setDays] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    Promise.resolve().then(() => {
      setDays(trialDaysLeft());
      setDismissed(sessionStorage.getItem("fc_trial_banner_dismissed") === "1");
    });
  }, []);

  if (days === null || dismissed) return null;

  const dismiss = () => {
    sessionStorage.setItem("fc_trial_banner_dismissed", "1");
    setDismissed(true);
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-[#003856]/15 bg-[#003856]/5 px-4 py-3 text-sm print:hidden">
      <Clock className="h-4 w-4 shrink-0 text-[#003856]" />
      <span className="font-medium text-[#1a1a2e]">
        {days > 0
          ? `Ihre Testphase endet in ${days} ${days === 1 ? "Tag" : "Tagen"}.`
          : "Ihre Testphase ist beendet."}
      </span>
      <Link
        href="/einstellungen?tab=abo"
        className="inline-flex items-center gap-1 font-semibold text-[#003856] hover:underline"
      >
        Plan auswählen <ArrowRight className="h-3.5 w-3.5" />
      </Link>
      <button onClick={dismiss} aria-label="Hinweis schließen" className="ml-auto rounded-lg p-1 text-[#64748b] transition hover:bg-[#003856]/5 hover:text-[#1a1a2e]">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
