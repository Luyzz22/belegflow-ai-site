"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let consented = true;
    try {
      consented = localStorage.getItem("fc_cookie_consent") === "true";
    } catch {
      consented = true;
    }
    if (!consented) Promise.resolve().then(() => setShow(true));
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[rgba(0,56,86,0.08)] bg-white shadow-xl print:hidden">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-[#c8985a]" />
          <p className="text-sm text-[#64748b]">
            Wir verwenden ausschließlich technisch notwendige Cookies für den Betrieb dieser Website.
            Keine Tracking- oder Marketing-Cookies.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link href="/datenschutz" className="text-sm font-medium text-[#003856] hover:underline">
            Datenschutzerklärung →
          </Link>
          <button
            onClick={() => {
              try {
                localStorage.setItem("fc_cookie_consent", "true");
              } catch {
                /* ignore */
              }
              setShow(false);
            }}
            className="rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
}
