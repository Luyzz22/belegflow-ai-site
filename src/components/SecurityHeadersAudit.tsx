"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, RefreshCw, Check, X } from "lucide-react";
import { dateDE } from "@/lib/format";

const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";

const EXPECTED: { header: string; label: string }[] = [
  { header: "strict-transport-security", label: "Strict-Transport-Security" },
  { header: "x-content-type-options", label: "X-Content-Type-Options" },
  { header: "x-frame-options", label: "X-Frame-Options" },
  { header: "x-xss-protection", label: "X-XSS-Protection" },
  { header: "referrer-policy", label: "Referrer-Policy" },
  { header: "permissions-policy", label: "Permissions-Policy" },
  { header: "content-security-policy", label: "Content-Security-Policy" },
];

export default function SecurityHeadersAudit() {
  const [values, setValues] = useState<Record<string, string | null>>({});
  const [checkedAt, setCheckedAt] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const check = useCallback(() => {
    setLoading(true);
    setError(false);
    fetch(window.location.origin, { method: "HEAD", cache: "no-store" })
      .then((res) => {
        const map: Record<string, string | null> = {};
        for (const { header } of EXPECTED) map[header] = res.headers.get(header);
        setValues(map);
        setCheckedAt(new Date().toISOString());
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => check());
  }, [check]);

  return (
    <div className={`${CARD} mt-6`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-[#1a1a2e]">
          <ShieldCheck className="h-5 w-5 text-[#003856]" /> Security-Headers Audit
        </h2>
        <button
          onClick={check}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2 text-sm font-medium text-[#003856] transition hover:bg-[#faf9f7] active:scale-95 disabled:opacity-50 print:hidden"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Erneut prüfen
        </button>
      </div>

      {error ? (
        <p className="text-sm text-red-600">Header konnten nicht ausgelesen werden.</p>
      ) : (
        <ul className="divide-y divide-[rgba(0,56,86,0.06)]">
          {EXPECTED.map(({ header, label }) => {
            const value = values[header];
            const present = !!value;
            return (
              <li key={header} className="flex items-start gap-3 py-2.5">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${present ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                  {present ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1a1a2e]">{label}</p>
                  <p className="break-words text-xs text-[#64748b]">{present ? value : "nicht gesetzt"}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 text-xs text-[#94a3b8]">
        {checkedAt ? `Zuletzt geprüft: ${dateDE(checkedAt, true)}` : "Wird geprüft …"}
      </p>
    </div>
  );
}
