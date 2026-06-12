import type { InvoiceListItem } from "@/lib/api-client";

export interface DuplicateMatch {
  id: number;
  rechnungsnummer: string;
  datum: string;
  betrag: number;
  waehrung?: string;
}

/**
 * Findet eine mögliche Dublette: gleicher Lieferant (Aufrufer filtert),
 * Betrag ±5 %, Datum ±7 Tage, andere ID.
 */
export function findDuplicate(
  current: { id: number; betrag: number; datum: string },
  others: InvoiceListItem[]
): DuplicateMatch | null {
  const cb = current.betrag || 0;
  const cd = Date.parse(current.datum);
  for (const o of others) {
    if (o.id === current.id) continue;
    const ob = o.betrag || 0;
    if (cb > 0) {
      if (Math.abs(ob - cb) / cb > 0.05) continue;
    } else if (ob !== 0) {
      continue;
    }
    const od = Date.parse(o.datum || o.created_at || "");
    if (Number.isFinite(cd) && Number.isFinite(od) && Math.abs(cd - od) > 7 * 86_400_000) continue;
    return { id: o.id, rechnungsnummer: o.rechnungsnummer, datum: o.datum, betrag: ob, waehrung: o.waehrung };
  }
  return null;
}
