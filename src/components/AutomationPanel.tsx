"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import Toggle from "@/components/Toggle";
import { useToast } from "@/components/toast/ToastProvider";
import { getRules, saveRules, type AutomationRule } from "@/lib/automationRules";

export default function AutomationPanel() {
  const { addToast } = useToast();
  const [rules, setRules] = useState<AutomationRule[]>(() => getRules());

  const persist = (next: AutomationRule[]) => {
    setRules(next);
    saveRules(next);
  };

  const toggle = (id: string, enabled: boolean) => {
    const next = rules.map((r) => (r.id === id ? { ...r, enabled } : r));
    persist(next);
    addToast({ type: enabled ? "success" : "info", text: `Regel „${rules.find((r) => r.id === id)?.name}“ ${enabled ? "aktiviert" : "deaktiviert"}` });
  };

  const setParam = (id: string, key: string, value: number) => {
    persist(rules.map((r) => (r.id === id ? { ...r, params: r.params.map((p) => (p.key === key ? { ...p, value } : p)) } : r)));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#64748b]">Wenn-dann-Regeln, die FlowCheck automatisch anwendet.</p>
      {rules.map((r) => (
        <div
          key={r.id}
          className="rounded-2xl border border-l-4 border-[rgba(0,56,86,0.08)] bg-white p-5 shadow-[0_1px_3px_rgba(0,56,86,0.06)]"
          style={{ borderLeftColor: r.enabled ? "#c8985a" : "rgba(0,56,86,0.15)" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="flex items-center gap-2 font-semibold text-[#1a1a2e]">
                <Zap className={`h-4 w-4 ${r.enabled ? "text-[#c8985a]" : "text-[#94a3b8]"}`} />
                {r.name}
              </h3>
              <p className="mt-1 text-sm text-[#64748b]">
                <span className="font-medium text-[#1a1a2e]">WENN</span> {r.wenn}{" "}
                <span className="font-medium text-[#1a1a2e]">DANN</span> {r.dann}.
              </p>
            </div>
            <Toggle checked={r.enabled} onChange={(v) => toggle(r.id, v)} label={r.name} />
          </div>

          {r.params.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4">
              {r.params.map((p) => (
                <div key={p.key} className="flex items-center gap-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-[#64748b]">{p.label}</label>
                  <input
                    type="number"
                    value={p.value}
                    disabled={!r.enabled}
                    onChange={(e) => setParam(r.id, p.key, Number(e.target.value))}
                    className="w-24 rounded-lg border border-[rgba(0,56,86,0.12)] px-3 py-1.5 text-sm outline-none focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20 disabled:bg-[#faf9f7]"
                  />
                  <span className="text-sm text-[#64748b]">{p.suffix}</span>
                </div>
              ))}
            </div>
          )}

          <p className="mt-3 text-right text-xs text-[#94a3b8]">
            {r.enabled ? (r.triggered > 0 ? `${r.triggered}× ausgelöst` : "Aktiv · noch nicht ausgelöst") : "Inaktiv"}
          </p>
        </div>
      ))}
    </div>
  );
}
