"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, CreditCard, Check } from "lucide-react";
import { flowcheckApi, ApiError, type InvoiceListItem } from "@/lib/api-client";
import { eur, dateDE } from "@/lib/format";
import { getPaidSet, markManyPaid } from "@/lib/payments";
import { zahlungszielFor } from "@/lib/stammdaten";
import PageHeader from "@/components/PageHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/States";
import { useToast } from "@/components/toast/ToastProvider";

const DAY = 86_400_000;
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";

type DueStatus = "paid" | "overdue" | "soon" | "later";

interface Due {
  inv: InvoiceListItem;
  dueTs: number;
  status: DueStatus;
}

export default function ZahlungenPage() {
  const { addToast } = useToast();
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [now, setNow] = useState(0);
  const [paidSet, setPaidSet] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    flowcheckApi
      .invoices("limit=500&offset=0")
      .then((r) => {
        setInvoices(r.items || []);
        setNow(Date.now());
        setPaidSet(getPaidSet());
        setError(null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Zahlungen konnten nicht geladen werden."))
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

  const dues = useMemo<Due[]>(() => {
    if (!now) return [];
    return invoices.map((inv) => {
      const base = Date.parse(inv.datum || inv.created_at || "");
      const dueTs = Number.isFinite(base) ? base + zahlungszielFor(inv.lieferant) * DAY : now;
      let status: DueStatus;
      if (paidSet.has(inv.id)) status = "paid";
      else if (dueTs < now) status = "overdue";
      else if (dueTs - now <= 7 * DAY) status = "soon";
      else status = "later";
      return { inv, dueTs, status };
    });
  }, [invoices, now, paidSet]);

  // Kalender des aktuellen Monats.
  const calendar = useMemo(() => {
    if (!now) return null;
    const d = new Date(now);
    const year = d.getFullYear();
    const month = d.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7; // Mo=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const byDay = new Map<number, DueStatus[]>();
    dues.forEach((due) => {
      const dd = new Date(due.dueTs);
      if (dd.getFullYear() === year && dd.getMonth() === month) {
        const day = dd.getDate();
        const arr = byDay.get(day) ?? [];
        arr.push(due.status);
        byDay.set(day, arr);
      }
    });
    return { year, month, startOffset, daysInMonth, byDay };
  }, [now, dues]);

  const proposal = useMemo(
    () =>
      dues
        .filter((d) => d.status === "overdue" || d.status === "soon")
        .sort((a, b) => a.dueTs - b.dueTs),
    [dues]
  );

  const selectedSum = proposal.filter((d) => selected.has(d.inv.id)).reduce((s, d) => s + (d.inv.betrag || 0), 0);

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const markPaid = () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    markManyPaid(ids);
    setPaidSet(getPaidSet());
    setSelected(new Set());
    addToast({ type: "success", text: `${ids.length} Zahlung(en) als bezahlt markiert.` });
  };

  const exportList = () => {
    const rows = proposal.filter((d) => selected.has(d.inv.id));
    const list = rows.length > 0 ? rows : proposal;
    const csv = [
      "Lieferant;Rechnungsnummer;Betrag;Faellig",
      ...list.map((d) => `${d.inv.lieferant};${d.inv.rechnungsnummer};${(d.inv.betrag || 0).toFixed(2)};${new Date(d.dueTs).toISOString().slice(0, 10)}`),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `zahlungsliste-${new Date(now).toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    addToast({ type: "success", text: "Zahlungsliste exportiert." });
  };

  if (loading) return <LoadingState label="Zahlungen werden geladen …" />;
  if (error) {
    return (
      <div className="fc-fade-in">
        <PageHeader title="Zahlungen" description="Fälligkeiten und Zahlungsvorschläge" />
        <ErrorState message={error} onRetry={retry} />
      </div>
    );
  }

  const DOT: Record<DueStatus, string> = {
    paid: "bg-emerald-500",
    overdue: "bg-red-500",
    soon: "bg-amber-500",
    later: "bg-[#94a3b8]",
  };

  return (
    <div className="fc-fade-in">
      <PageHeader title="Zahlungen" description="Fälligkeiten, Zahlungskalender und Zahlungsvorschläge" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Kalender */}
        <div className={CARD}>
          <h2 className="mb-1 text-xl font-semibold text-[#1a1a2e]">
            {calendar ? `${MONTHS[calendar.month]} ${calendar.year}` : "Kalender"}
          </h2>
          <p className="mb-4 text-xs text-[#64748b]">Fälligkeiten (Zahlungsziel je Lieferant, Standard 30 Tage).</p>
          {calendar && (
            <>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wider text-[#94a3b8]">
                {WEEKDAYS.map((w) => (
                  <div key={w} className="py-1">{w}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: calendar.startOffset }).map((_, i) => (
                  <div key={`e${i}`} />
                ))}
                {Array.from({ length: calendar.daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const statuses = calendar.byDay.get(day) ?? [];
                  const isToday = new Date(now).getDate() === day;
                  return (
                    <div
                      key={day}
                      className={`relative flex h-10 flex-col items-center justify-center rounded-lg text-sm ${
                        isToday ? "bg-[#003856] font-semibold text-white" : "text-[#1a1a2e] hover:bg-[#faf9f7]"
                      }`}
                    >
                      {day}
                      {statuses.length > 0 && (
                        <span className="absolute bottom-1 flex gap-0.5">
                          {[...new Set(statuses)].slice(0, 3).map((s, j) => (
                            <span key={j} className={`h-1.5 w-1.5 rounded-full ${DOT[s]}`} />
                          ))}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#64748b]">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Bezahlt</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />Fällig (≤ 7 Tage)</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" />Überfällig</span>
              </div>
            </>
          )}
        </div>

        {/* Zahlungsvorschlag */}
        <div className={CARD}>
          <h2 className="mb-1 text-xl font-semibold text-[#1a1a2e]">Empfohlene Zahlungen</h2>
          <p className="mb-4 text-xs text-[#64748b]">Überfällige und in den nächsten 7 Tagen fällige Rechnungen.</p>
          {proposal.length === 0 ? (
            <EmptyState
              icon={<CreditCard className="h-6 w-6" />}
              title="Keine fälligen Zahlungen"
              description="Fälligkeiten werden automatisch aus Ihren Rechnungen berechnet."
              action={
                <Link
                  href="/rechnungen"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95"
                >
                  Zu den Rechnungen →
                </Link>
              }
            />
          ) : (
            <>
              <ul className="divide-y divide-[rgba(0,56,86,0.06)]">
                {proposal.map((d) => (
                  <li key={d.inv.id} className="flex items-center gap-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(d.inv.id)}
                      onChange={() => toggle(d.inv.id)}
                      className="h-4 w-4 shrink-0 accent-[#003856]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#1a1a2e]">{d.inv.lieferant || "—"}</p>
                      <p className="text-xs text-[#64748b]">
                        {d.inv.rechnungsnummer || `#${d.inv.id}`} · fällig {dateDE(new Date(d.dueTs).toISOString())}
                        {d.status === "overdue" && <span className="ml-1 font-semibold text-red-600">überfällig</span>}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-[#003856]">{eur(d.inv.betrag, d.inv.waehrung)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-[rgba(0,56,86,0.06)] pt-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-[#64748b]">Summe ausgewählt</span>
                  <span className="text-lg font-bold text-[#003856]">{eur(selectedSum)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={markPaid}
                    disabled={selected.size === 0}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    Als bezahlt markieren
                  </button>
                  <button
                    onClick={exportList}
                    className="inline-flex items-center gap-2 rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm font-medium text-[#003856] transition-all hover:bg-[#faf9f7] active:scale-95"
                  >
                    <Download className="h-4 w-4" />
                    Zahlungsliste exportieren
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
