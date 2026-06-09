"use client";

import { useState } from "react";
import { Plus, X, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";

interface ApprovalRule {
  id: number;
  ab_betrag: number;
  stufe: string;
}

export default function EinstellungenPage() {
  const { user } = useAuth();
  const [rules, setRules] = useState<ApprovalRule[]>([
    { id: 1, ab_betrag: 0, stufe: "Buchhaltung" },
    { id: 2, ab_betrag: 5000, stufe: "Teamleitung" },
    { id: 3, ab_betrag: 25000, stufe: "Geschäftsführung" },
  ]);
  const [schema, setSchema] = useState("SKR03");
  const [autoExport, setAutoExport] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const updateRule = (id: number, patch: Partial<ApprovalRule>) =>
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const addRule = () =>
    setRules((prev) => [...prev, { id: Date.now(), ab_betrag: 0, stufe: "" }]);

  const removeRule = (id: number) => setRules((prev) => prev.filter((r) => r.id !== id));

  const save = () => {
    setToast("Einstellungen gespeichert");
    setTimeout(() => setToast(null), 2500);
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="fc-fade-in">
      <PageHeader
        title="Einstellungen"
        description="Freigaberegeln, Kontierungsschema und Export-Optionen für Ihren Mandanten"
        action={
          <button
            onClick={save}
            disabled={!isAdmin}
            className="rounded-xl bg-[#003856] px-5 py-2.5 font-medium text-white transition-all hover:bg-[#002a42] disabled:opacity-50"
          >
            Speichern
          </button>
        }
      />

      {!isAdmin && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <Lock className="h-4 w-4 shrink-0" />
          Nur Administratoren können Mandanten-Einstellungen ändern. Sie sehen die aktuelle Konfiguration.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Freigaberegeln */}
        <section className="rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#1a1a2e]">Freigaberegeln</h2>
            <button
              onClick={addRule}
              disabled={!isAdmin}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-[#003856] transition-all hover:bg-[#003856]/5 disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              Regel
            </button>
          </div>
          <p className="mb-5 text-sm text-[#64748b]">
            Ab welchem Betrag (€) ist welche Freigabestufe erforderlich?
          </p>
          <div className="space-y-3">
            {rules
              .slice()
              .sort((a, b) => a.ab_betrag - b.ab_betrag)
              .map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <span className="text-sm text-[#64748b]">ab</span>
                  <input
                    type="number"
                    value={r.ab_betrag}
                    disabled={!isAdmin}
                    onChange={(e) => updateRule(r.id, { ab_betrag: Number(e.target.value) })}
                    className="w-28 rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20 disabled:bg-[#faf9f7]"
                  />
                  <span className="text-sm text-[#64748b]">€ →</span>
                  <input
                    value={r.stufe}
                    disabled={!isAdmin}
                    onChange={(e) => updateRule(r.id, { stufe: e.target.value })}
                    className="flex-1 rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20 disabled:bg-[#faf9f7]"
                  />
                  {isAdmin && (
                    <button
                      onClick={() => removeRule(r.id)}
                      className="text-[#64748b] transition hover:text-red-600"
                      aria-label="Entfernen"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
          </div>
        </section>

        {/* Kontierungsschema + Export */}
        <section className="space-y-6">
          <div className="rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
            <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Kontierungsschema</h2>
            <div className="flex gap-2">
              {["SKR03", "SKR04"].map((s) => (
                <button
                  key={s}
                  onClick={() => isAdmin && setSchema(s)}
                  disabled={!isAdmin}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    schema === s
                      ? "bg-[#003856] text-white"
                      : "border border-[rgba(0,56,86,0.12)] bg-[#faf9f7] text-[#64748b] hover:bg-[#003856]/5"
                  } disabled:opacity-60`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-[#64748b]">
              Standardkontenrahmen für die automatische Kontierung.
            </p>
          </div>

          <div className="rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
            <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Export</h2>
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-sm text-[#1a1a2e]">Automatischer DATEV-Export nach Freigabe</span>
              <button
                type="button"
                role="switch"
                aria-checked={autoExport}
                onClick={() => isAdmin && setAutoExport((v) => !v)}
                disabled={!isAdmin}
                className={`relative h-6 w-11 rounded-full transition ${
                  autoExport ? "bg-[#003856]" : "bg-[rgba(0,56,86,0.18)]"
                } disabled:opacity-60`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                    autoExport ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </label>
          </div>
        </section>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#003856] px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
