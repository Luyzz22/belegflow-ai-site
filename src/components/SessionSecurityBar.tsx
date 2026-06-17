"use client";

import { useEffect, useState } from "react";

const MAX_SESSION_MS = 8 * 60 * 60 * 1000; // 8 Stunden (siehe AuthProvider)
const WARN_MS = 30 * 60 * 1000;

function format(ms: number): string {
  if (ms <= 0) return "abgelaufen";
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function SessionSecurityBar() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const compute = () => {
      const raw = localStorage.getItem("fc_last_login");
      const start = raw ? Date.parse(raw) : NaN;
      if (!Number.isFinite(start)) {
        setRemaining(null);
        return;
      }
      setRemaining(Math.max(0, MAX_SESSION_MS - (Date.now() - start)));
    };
    Promise.resolve().then(compute);
    const id = setInterval(compute, 30000);
    return () => clearInterval(id);
  }, []);

  const warn = remaining !== null && remaining > 0 && remaining < WARN_MS;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-[#64748b] print:hidden">
      <span>🔒 TLS 1.3</span>
      <span aria-hidden className="text-[#cbd5e1]">·</span>
      <span>🇩🇪 Server DE</span>
      <span aria-hidden className="text-[#cbd5e1]">·</span>
      <span>🛡️ CSP aktiv</span>
      <span aria-hidden className="text-[#cbd5e1]">·</span>
      {remaining === null ? (
        <span>⏱️ Session aktiv</span>
      ) : warn ? (
        <span className="animate-pulse font-semibold text-amber-600">
          ⚠️ Session läuft in {format(remaining)} ab
        </span>
      ) : (
        <span>⏱️ Session: {format(remaining)}</span>
      )}
    </div>
  );
}
