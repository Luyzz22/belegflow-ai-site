"use client";

import { useState } from "react";
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
            className="rounded-xl bg-[#003856] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#002a42]"
          >
            Speichern
          </button>
        }
      />

      {!isAdmin && (
        <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
          Nur Administratoren können Mandanten-Einstellungen ändern. Sie sehen die aktuelle Konfiguration.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Freigaberegeln */}
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-800">Freigaberegeln</h2>
            <button
              onClick={addRule}
              disabled={!isAdmin}
              className="text-sm font-medium text-[#003856] hover:underline disabled:opacity-40"
            >
              + Regel
            </button>
          </div>
          <p className="mb-4 text-xs text-stone-500">
            Ab welchem Betrag (€) ist welche Freigabestufe erforderlich?
          </p>
          <div className="space-y-3">
            {rules
              .slice()
              .sort((a, b) => a.ab_betrag - b.ab_betrag)
              .map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <span className="text-sm text-stone-500">ab</span>
                  <input
                    type="number"
                    value={r.ab_betrag}
                    disabled={!isAdmin}
                    onChange={(e) => updateRule(r.id, { ab_betrag: Number(e.target.value) })}
                    className="w-28 rounded-lg border border-stone-200 px-3 py-1.5 text-sm outline-none focus:border-[#003856] disabled:bg-stone-50"
                  />
                  <span className="text-sm text-stone-500">€ →</span>
                  <input
                    value={r.stufe}
                    disabled={!isAdmin}
                    onChange={(e) => updateRule(r.id, { stufe: e.target.value })}
                    className="flex-1 rounded-lg border border-stone-200 px-3 py-1.5 text-sm outline-none focus:border-[#003856] disabled:bg-stone-50"
                  />
                  {isAdmin && (
                    <button
                      onClick={() => removeRule(r.id)}
                      className="text-stone-300 transition hover:text-rose-500"
                      aria-label="Entfernen"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
          </div>
        </section>

        {/* Kontierungsschema + Export */}
        <section className="space-y-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
            <h2 className="mb-4 text-sm font-semibold text-stone-800">Kontierungsschema</h2>
            <div className="flex gap-2">
              {["SKR03", "SKR04"].map((s) => (
                <button
                  key={s}
                  onClick={() => isAdmin && setSchema(s)}
                  disabled={!isAdmin}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    schema === s
                      ? "bg-[#003856] text-white"
                      : "bg-stone-50 text-stone-600 ring-1 ring-stone-200 hover:bg-stone-100"
                  } disabled:opacity-60`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-stone-500">
              Standardkontenrahmen für die automatische Kontierung.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
            <h2 className="mb-4 text-sm font-semibold text-stone-800">Export</h2>
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-sm text-stone-700">Automatischer DATEV-Export nach Freigabe</span>
              <button
                type="button"
                role="switch"
                aria-checked={autoExport}
                onClick={() => isAdmin && setAutoExport((v) => !v)}
                disabled={!isAdmin}
                className={`relative h-6 w-11 rounded-full transition ${
                  autoExport ? "bg-[#003856]" : "bg-stone-300"
                } disabled:opacity-60`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
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
