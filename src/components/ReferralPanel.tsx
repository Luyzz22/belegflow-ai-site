"use client";

import { useEffect, useState } from "react";
import { Gift, Copy, Users, Link2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/toast/ToastProvider";

const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";

function userId(): string {
  if (typeof window === "undefined") return "USR_DEMO";
  try {
    const raw = localStorage.getItem("flowcheck_user");
    if (raw) {
      const u = JSON.parse(raw) as { id?: string | number };
      if (u.id != null) return `USR_${u.id}`;
    }
  } catch {
    // ignore
  }
  return "USR_DEMO";
}

export default function ReferralPanel() {
  const { addToast } = useToast();
  const [link, setLink] = useState("");
  const [copies, setCopies] = useState(0);

  useEffect(() => {
    Promise.resolve().then(() => {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://belegflow-ai.de";
      setLink(`${origin}/?ref=${userId()}`);
      setCopies(Number(localStorage.getItem("fc_ref_copies") || "0"));
    });
  }, []);

  const copy = () => {
    navigator.clipboard?.writeText(link).then(
      () => {
        const next = copies + 1;
        setCopies(next);
        localStorage.setItem("fc_ref_copies", String(next));
        addToast({ type: "success", text: "Empfehlungslink kopiert" });
      },
      () => addToast({ type: "error", text: "Kopieren fehlgeschlagen" })
    );
  };

  const stats = [
    { icon: Link2, label: "Link geteilt", value: `${copies}×` },
    { icon: Users, label: "Registrierungen", value: "0" },
    { icon: CheckCircle2, label: "Aktive Empfehlungen", value: "0" },
  ];

  return (
    <div className="space-y-6">
      <section className={CARD}>
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#003856]/5 text-[#c8985a]">
            <Gift className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-semibold text-[#1a1a2e]">Empfehlen Sie FlowCheck AI+ weiter</h2>
        </div>
        <p className="mb-4 text-sm text-[#64748b]">
          Für jede erfolgreiche Empfehlung erhalten Sie und Ihr Kontakt <strong>1 Monat kostenlos</strong>.
        </p>

        <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[#64748b]">Ihr Empfehlungslink</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-[rgba(0,56,86,0.12)] bg-[#faf9f7] px-3 py-2.5">
            <Link2 className="h-4 w-4 shrink-0 text-[#64748b]" />
            <code className="flex-1 truncate font-mono text-xs text-[#1a1a2e]">{link || "—"}</code>
          </div>
          <button
            onClick={copy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95"
          >
            <Copy className="h-4 w-4" /> Link kopieren
          </button>
        </div>
      </section>

      <section className={CARD}>
        <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Empfehlungs-Statistik</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-3 rounded-xl bg-[#faf9f7] p-4">
                <Icon className="h-5 w-5 shrink-0 text-[#003856]" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-[#64748b]">{s.label}</p>
                  <p className="text-lg font-bold text-[#1a1a2e]">{s.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
