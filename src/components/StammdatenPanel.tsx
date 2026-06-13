"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { flowcheckApi, type Lieferant } from "@/lib/api-client";
import {
  getKontenplan,
  saveKontenplan,
  getKostenstellen,
  saveKostenstellen,
  getLieferantStamm,
  saveLieferantStamm,
  type Konto,
  type Kostenstelle,
  type LieferantStamm,
} from "@/lib/stammdaten";
import { useToast } from "@/components/toast/ToastProvider";

const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";
const INPUT =
  "w-full rounded-lg border border-[rgba(0,56,86,0.12)] px-3 py-2 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20";
const LABEL = "mb-1 block text-xs font-medium uppercase tracking-wider text-[#64748b]";

function SaveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95"
    >
      <Save className="h-4 w-4" />
      Speichern
    </button>
  );
}

function Kontenplan() {
  const { addToast } = useToast();
  const [rows, setRows] = useState<Konto[]>(() => getKontenplan());
  const upd = (i: number, patch: Partial<Konto>) => setRows((p) => p.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <div className={CARD}>
      <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Kontenplan</h2>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <input value={r.konto} onChange={(e) => upd(i, { konto: e.target.value })} className={`${INPUT} w-24`} placeholder="Konto" />
            <input value={r.bezeichnung} onChange={(e) => upd(i, { bezeichnung: e.target.value })} className={`${INPUT} min-w-[180px] flex-1`} placeholder="Bezeichnung" />
            <input value={r.typ} onChange={(e) => upd(i, { typ: e.target.value })} className={`${INPUT} w-28`} placeholder="Typ" />
            <button onClick={() => setRows((p) => p.filter((_, j) => j !== i))} className="rounded-lg p-2 text-[#64748b] transition hover:bg-red-50 hover:text-red-600" aria-label="Entfernen">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button onClick={() => setRows((p) => [...p, { konto: "", bezeichnung: "", typ: "Aufwand" }])} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-[#003856] transition hover:bg-[#003856]/5 active:scale-95">
          <Plus className="h-4 w-4" /> Konto hinzufügen
        </button>
      </div>
      <SaveBtn onClick={() => { saveKontenplan(rows); addToast({ type: "success", text: "Kontenplan gespeichert" }); }} />
    </div>
  );
}

function Kostenstellen() {
  const { addToast } = useToast();
  const [rows, setRows] = useState<Kostenstelle[]>(() => getKostenstellen());
  const upd = (i: number, patch: Partial<Kostenstelle>) => setRows((p) => p.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <div className={CARD}>
      <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Kostenstellen</h2>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <input value={r.nr} onChange={(e) => upd(i, { nr: e.target.value })} className={`${INPUT} w-24`} placeholder="Nr." />
            <input value={r.bezeichnung} onChange={(e) => upd(i, { bezeichnung: e.target.value })} className={`${INPUT} min-w-[180px] flex-1`} placeholder="Bezeichnung" />
            <button onClick={() => setRows((p) => p.filter((_, j) => j !== i))} className="rounded-lg p-2 text-[#64748b] transition hover:bg-red-50 hover:text-red-600" aria-label="Entfernen">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <button onClick={() => setRows((p) => [...p, { nr: "", bezeichnung: "" }])} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-[#003856] transition hover:bg-[#003856]/5 active:scale-95">
          <Plus className="h-4 w-4" /> Kostenstelle hinzufügen
        </button>
      </div>
      <SaveBtn onClick={() => { saveKostenstellen(rows); addToast({ type: "success", text: "Kostenstellen gespeichert" }); }} />
    </div>
  );
}

function LieferantenStamm() {
  const { addToast } = useToast();
  const [items, setItems] = useState<Lieferant[]>([]);
  const [forms, setForms] = useState<Record<string, LieferantStamm>>({});
  const [konten] = useState<Konto[]>(() => getKontenplan());
  const [kostenstellen] = useState<Kostenstelle[]>(() => getKostenstellen());
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    flowcheckApi
      .lieferanten()
      .then((r) => {
        const list = r.items || [];
        setItems(list);
        const f: Record<string, LieferantStamm> = {};
        list.forEach((l) => (f[l.name] = getLieferantStamm(l.name)));
        setForms(f);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const upd = (name: string, patch: Partial<LieferantStamm>) =>
    setForms((p) => ({ ...p, [name]: { ...p[name], ...patch } }));

  if (loading) return <div className={CARD}><p className="text-sm text-[#64748b]">Lieferanten werden geladen …</p></div>;
  if (items.length === 0) return <div className={CARD}><p className="text-sm text-[#64748b]">Noch keine Lieferanten erfasst.</p></div>;

  return (
    <div className="space-y-4">
      {items.map((l) => {
        const f = forms[l.name] || {};
        return (
          <div key={l.name} className={CARD}>
            <h3 className="mb-4 text-lg font-semibold text-[#1a1a2e]">{l.name}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className={LABEL}>Standard-Konto</label>
                <select value={f.konto ?? ""} onChange={(e) => upd(l.name, { konto: e.target.value })} className={INPUT}>
                  <option value="">Standard (4400)</option>
                  {konten.map((k) => (
                    <option key={k.konto} value={k.konto}>{k.konto} — {k.bezeichnung}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL}>Kostenstelle</label>
                <select value={f.kostenstelle ?? ""} onChange={(e) => upd(l.name, { kostenstelle: e.target.value })} className={INPUT}>
                  <option value="">—</option>
                  {kostenstellen.map((k) => (
                    <option key={k.nr} value={k.nr}>{k.nr} — {k.bezeichnung}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL}>Zahlungsziel (Tage)</label>
                <input type="number" value={f.zahlungsziel ?? ""} onChange={(e) => upd(l.name, { zahlungsziel: Number(e.target.value) })} className={INPUT} placeholder="30" />
              </div>
              <div>
                <label className={LABEL}>Skonto-Konditionen</label>
                <input value={f.skonto ?? ""} onChange={(e) => upd(l.name, { skonto: e.target.value })} className={INPUT} placeholder="z. B. 2% / 10 Tage" />
              </div>
              <div>
                <label className={LABEL}>Ansprechpartner</label>
                <input value={f.ansprechpartner ?? ""} onChange={(e) => upd(l.name, { ansprechpartner: e.target.value })} className={INPUT} />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className={LABEL}>Notizen</label>
                <input value={f.notizen ?? ""} onChange={(e) => upd(l.name, { notizen: e.target.value })} className={INPUT} />
              </div>
            </div>
            <SaveBtn onClick={() => { saveLieferantStamm(l.name, forms[l.name] || {}); addToast({ type: "success", text: `Stammdaten für ${l.name} gespeichert` }); }} />
          </div>
        );
      })}
    </div>
  );
}

export default function StammdatenPanel({ which }: { which: "konten" | "kostenstellen" | "lieferanten" }) {
  if (which === "konten") return <Kontenplan />;
  if (which === "kostenstellen") return <Kostenstellen />;
  return <LieferantenStamm />;
}
