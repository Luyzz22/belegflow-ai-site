"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Pencil } from "lucide-react";
import { useToast } from "@/components/toast/ToastProvider";
import { getTemplates, saveTemplates, type KontierungsVorlage } from "@/lib/templates";

const INPUT = "rounded-lg border border-[rgba(0,56,86,0.12)] px-3 py-2 text-sm outline-none focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20";

export default function TemplatePanel() {
  const { addToast } = useToast();
  const [list, setList] = useState<KontierungsVorlage[]>(() => getTemplates());
  const [editId, setEditId] = useState<string | null>(null);

  const persist = (next: KontierungsVorlage[]) => {
    setList(next);
    saveTemplates(next);
  };

  const upd = (id: string, patch: Partial<KontierungsVorlage>) =>
    setList((p) => p.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const save = (id: string) => {
    saveTemplates(list);
    setEditId(null);
    addToast({ type: "success", text: `Vorlage „${list.find((t) => t.id === id)?.name}“ gespeichert` });
  };

  const remove = (id: string) => persist(list.filter((t) => t.id !== id));

  const addNew = () => {
    const t: KontierungsVorlage = { id: `tpl-${Date.now()}`, emoji: "📄", name: "Neue Vorlage", konto: "4400", gegenkonto: "1200", steuerschluessel: "9", fuer: "" };
    persist([...list, t]);
    setEditId(t.id);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#64748b]">Kontierungs-Vorlagen für häufige Rechnungstypen — im Rechnungsdetail anwendbar.</p>
      {list.map((t) => (
        <div key={t.id} className="rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-5 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
          {editId === t.id ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <input value={t.emoji} onChange={(e) => upd(t.id, { emoji: e.target.value })} className={`${INPUT} w-14 text-center`} aria-label="Emoji" />
                <input value={t.name} onChange={(e) => upd(t.id, { name: e.target.value })} placeholder="Name" className={`${INPUT} min-w-[160px] flex-1`} />
              </div>
              <div className="flex flex-wrap gap-2">
                <input value={t.konto} onChange={(e) => upd(t.id, { konto: e.target.value })} placeholder="Konto" className={`${INPUT} w-24`} />
                <input value={t.gegenkonto} onChange={(e) => upd(t.id, { gegenkonto: e.target.value })} placeholder="Gegenkonto" className={`${INPUT} w-28`} />
                <input value={t.steuerschluessel} onChange={(e) => upd(t.id, { steuerschluessel: e.target.value })} placeholder="SK" className={`${INPUT} w-16`} />
              </div>
              <input value={t.fuer} onChange={(e) => upd(t.id, { fuer: e.target.value })} placeholder="Für …" className={`${INPUT} w-full`} />
              <div className="flex gap-2">
                <button onClick={() => save(t.id)} className="inline-flex items-center gap-2 rounded-xl bg-[#003856] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95">
                  <Save className="h-4 w-4" /> Speichern
                </button>
                <button onClick={() => remove(t.id)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 active:scale-95">
                  <Trash2 className="h-4 w-4" /> Entfernen
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-[#1a1a2e]">
                  <span className="mr-1.5">{t.emoji}</span>
                  {t.name}
                </h3>
                <p className="mt-1 text-sm text-[#64748b]">
                  Konto: {t.konto} · Gegenkonto: {t.gegenkonto} · SK: {t.steuerschluessel}
                </p>
                {t.fuer && <p className="mt-0.5 text-xs text-[#94a3b8]">Für: {t.fuer}</p>}
              </div>
              <button onClick={() => setEditId(t.id)} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-[#003856] transition hover:bg-[#003856]/5 active:scale-95">
                <Pencil className="h-4 w-4" /> Bearbeiten
              </button>
            </div>
          )}
        </div>
      ))}
      <button onClick={addNew} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[rgba(0,56,86,0.2)] px-5 py-3 text-sm font-medium text-[#003856] transition hover:bg-[#faf9f7] active:scale-95">
        <Plus className="h-4 w-4" /> Eigene Vorlage erstellen
      </button>
    </div>
  );
}
