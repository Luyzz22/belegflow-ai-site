"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Upload, Plus, Check, ArrowLeftRight, Trash2 } from "lucide-react";
import { flowcheckApi, ApiError, type InvoiceListItem } from "@/lib/api-client";
import { eur, dateDE } from "@/lib/format";
import { getPaidSet, setPaid } from "@/lib/payments";
import PageHeader from "@/components/PageHeader";
import { LoadingState, ErrorState } from "@/components/States";
import { useToast } from "@/components/toast/ToastProvider";

const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-5 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";
const INPUT = "rounded-lg border border-[rgba(0,56,86,0.12)] px-3 py-2 text-sm outline-none focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20";

interface BankTx {
  id: string;
  datum: string;
  betrag: number;
  zweck: string;
}

type MatchKind = "auto" | "suggest" | "none";

function loadTx(): BankTx[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("fc_bank_tx") || "[]") as BankTx[];
  } catch {
    return [];
  }
}
function saveTx(list: BankTx[]) {
  if (typeof window !== "undefined") localStorage.setItem("fc_bank_tx", JSON.stringify(list));
}

export default function AbgleichPage() {
  const { addToast } = useToast();
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [txs, setTxs] = useState<BankTx[]>([]);
  const [paid, setPaidState] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ datum: "", betrag: "", zweck: "" });

  const load = useCallback(() => {
    flowcheckApi
      .invoices("limit=500&offset=0")
      .then((r) => {
        setInvoices(r.items || []);
        setPaidState(getPaidSet());
        setTxs(loadTx());
        setError(null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Daten konnten nicht geladen werden."))
      .finally(() => setLoading(false));
  }, []);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    void load();
  }, [load]);

  useEffect(() => {
    void load();
  }, [load]);

  const open = useMemo(() => invoices.filter((i) => !paid.has(i.id)), [invoices, paid]);

  // Matching: pro offener Rechnung den besten Bankumsatz finden.
  const rows = useMemo(() => {
    const used = new Set<string>();
    return open.map((inv) => {
      let best: { tx: BankTx; kind: MatchKind } | null = null;
      for (const tx of txs) {
        if (used.has(tx.id)) continue;
        const diff = Math.abs(Math.abs(tx.betrag) - (inv.betrag || 0));
        if (diff <= 0.01) {
          best = { tx, kind: "auto" };
          break;
        }
        if (inv.betrag && diff / inv.betrag <= 0.05 && (!best || best.kind !== "suggest")) {
          best = { tx, kind: "suggest" };
        }
      }
      if (best) used.add(best.tx.id);
      return { inv, match: best };
    });
  }, [open, txs]);

  const addTx = () => {
    const betrag = Number(form.betrag.replace(",", "."));
    if (!form.datum || !betrag) {
      addToast({ type: "warning", text: "Bitte Datum und Betrag angeben." });
      return;
    }
    const next = [...txs, { id: `t-${Date.now()}`, datum: form.datum, betrag, zweck: form.zweck }];
    setTxs(next);
    saveTx(next);
    setForm({ datum: "", betrag: "", zweck: "" });
  };

  const removeTx = (id: string) => {
    const next = txs.filter((t) => t.id !== id);
    setTxs(next);
    saveTx(next);
  };

  const importCsv = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const parsed: BankTx[] = [];
      text.split(/\r?\n/).forEach((line, i) => {
        if (!line.trim() || (i === 0 && /datum/i.test(line))) return;
        const [datum, betrag, ...rest] = line.split(/[;,\t]/);
        const b = Number((betrag || "").replace(",", "."));
        if (datum && b) parsed.push({ id: `t-${Date.now()}-${i}`, datum: datum.trim(), betrag: b, zweck: rest.join(" ").trim() });
      });
      if (parsed.length === 0) {
        addToast({ type: "error", text: "Keine gültigen Zeilen gefunden." });
        return;
      }
      const next = [...txs, ...parsed];
      setTxs(next);
      saveTx(next);
      addToast({ type: "success", text: `${parsed.length} Bankumsätze importiert.` });
    };
    reader.readAsText(file);
  };

  const markPaid = (id: number) => {
    setPaid(id, true);
    setPaidState(getPaidSet());
    addToast({ type: "success", text: "Rechnung als bezahlt markiert." });
  };

  if (loading) return <LoadingState label="Abgleich wird geladen …" />;
  if (error) {
    return (
      <div className="fc-fade-in">
        <PageHeader title="Abgleich" description="Rechnungen mit Bankumsätzen abgleichen" />
        <ErrorState message={error} onRetry={retry} />
      </div>
    );
  }

  const usedTxIds = new Set(rows.map((r) => r.match?.tx.id).filter(Boolean) as string[]);
  const unmatchedTx = txs.filter((t) => !usedTxIds.has(t.id));

  return (
    <div className="fc-fade-in">
      <PageHeader title="Abgleich" description="Offene Rechnungen mit Bankumsätzen abgleichen" />

      {/* Import / Eingabe */}
      <div className={`${CARD} mb-6`}>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#64748b]">Datum</label>
            <input type="date" value={form.datum} onChange={(e) => setForm((p) => ({ ...p, datum: e.target.value }))} className={INPUT} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#64748b]">Betrag (€)</label>
            <input value={form.betrag} onChange={(e) => setForm((p) => ({ ...p, betrag: e.target.value }))} placeholder="-7931,35" className={`${INPUT} w-32`} />
          </div>
          <div className="min-w-[160px] flex-1">
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#64748b]">Verwendungszweck</label>
            <input value={form.zweck} onChange={(e) => setForm((p) => ({ ...p, zweck: e.target.value }))} placeholder="SEPA …" className={`${INPUT} w-full`} />
          </div>
          <button onClick={addTx} className="inline-flex items-center gap-1.5 rounded-xl bg-[#003856] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95">
            <Plus className="h-4 w-4" /> Umsatz
          </button>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2 text-sm font-medium text-[#003856] transition hover:bg-[#faf9f7] active:scale-95">
            <Upload className="h-4 w-4" /> CSV importieren
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) importCsv(e.target.files[0]);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-[#94a3b8]">CSV-Format: Datum;Betrag;Verwendungszweck</p>
      </div>

      {/* Abgleich-Liste */}
      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-[#64748b]">Keine offenen Rechnungen.</p>
        ) : (
          rows.map(({ inv, match }) => {
            const kind: MatchKind = match?.kind ?? "none";
            return (
              <div key={inv.id} className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-[1fr_auto_1fr]">
                {/* Rechnung */}
                <div className={CARD}>
                  <p className="text-sm font-semibold text-[#1a1a2e]">{inv.rechnungsnummer || `#${inv.id}`}</p>
                  <p className="text-xs text-[#64748b]">{inv.lieferant}</p>
                  <p className="mt-1 font-semibold text-[#003856]">{eur(inv.betrag, inv.waehrung)}</p>
                </div>

                {/* Connector / Status */}
                <div className="flex items-center justify-center">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      kind === "auto"
                        ? "fc-pop bg-emerald-50 text-emerald-700"
                        : kind === "suggest"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {kind === "none" ? "❌ Offen" : <ArrowLeftRight className="h-3.5 w-3.5" />}
                    {kind === "auto" && "Auto-Match"}
                    {kind === "suggest" && "Betrag passt"}
                  </span>
                </div>

                {/* Bankumsatz */}
                {match ? (
                  <div className={CARD}>
                    <p className="text-sm font-semibold text-[#1a1a2e]">{dateDE(match.tx.datum)}</p>
                    <p className="text-xs text-[#64748b]">{match.tx.zweck || "—"}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#1a1a2e]">{eur(Math.abs(match.tx.betrag))}</span>
                      <button
                        onClick={() => markPaid(inv.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700 active:scale-95"
                      >
                        <Check className="h-3.5 w-3.5" /> Bezahlt
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-2xl border border-dashed border-[rgba(0,56,86,0.15)] bg-[#faf9f7] p-5 text-xs text-[#94a3b8]">
                    Kein passender Umsatz
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Nicht zugeordnete Umsätze */}
      {unmatchedTx.length > 0 && (
        <div className={`${CARD} mt-6`}>
          <h2 className="mb-3 text-sm font-semibold text-[#1a1a2e]">Nicht zugeordnete Bankumsätze</h2>
          <ul className="divide-y divide-[rgba(0,56,86,0.06)]">
            {unmatchedTx.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="text-[#64748b]">{dateDE(t.datum)} · {t.zweck || "—"}</span>
                <span className="flex items-center gap-2">
                  <span className="font-medium text-[#1a1a2e]">{eur(Math.abs(t.betrag))}</span>
                  <button onClick={() => removeTx(t.id)} className="rounded-lg p-1 text-[#64748b] transition hover:bg-red-50 hover:text-red-600" aria-label="Entfernen">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
