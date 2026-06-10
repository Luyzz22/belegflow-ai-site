import type { InvoiceDetail } from "@/lib/api-client";

export interface ConfidenceCheck {
  label: string;
  ok: boolean;
  points: number;
}

export interface ConfidenceResult {
  score: number; // 0–100
  checks: ConfidenceCheck[];
  tier: "high" | "medium" | "low";
  label: string;
}

function pflichtComplete(detail: InvoiceDetail): boolean {
  const p = detail.validierung?.pflichtangaben ?? [];
  if (p.length === 0) return false;
  return p.every((x) => (typeof x === "string" ? true : !!x.vorhanden));
}

function hasDuplicate(detail: InvoiceDetail): boolean {
  return (detail.anomalien ?? []).some((a) => {
    const text = (typeof a === "string" ? a : `${a.typ ?? ""} ${a.beschreibung ?? ""}`).toLowerCase();
    return text.includes("duplik") || text.includes("dublet");
  });
}

/**
 * Client-seitiger Konfidenz-Score (0–100) aus den vorhandenen Prüfdaten.
 * `supplierKnown` (Lieferant mit >1 Rechnung) kommt optional von außen.
 */
export function computeConfidence(
  detail: InvoiceDetail,
  opts?: { supplierKnown?: boolean }
): ConfidenceResult {
  const summeOk =
    Math.abs((detail.netto || 0) + (detail.ust_betrag || 0) - (detail.betrag || 0)) <= 0.01;

  const checks: ConfidenceCheck[] = [
    { label: "§14-Pflichtangaben vollständig", ok: pflichtComplete(detail), points: 20 },
    { label: "IBAN gültig", ok: !!detail.validierung?.iban_valid, points: 15 },
    { label: "USt-ID gültig", ok: !!detail.validierung?.ustid_valid, points: 15 },
    { label: "Betragscheck (Netto + USt = Brutto)", ok: summeOk, points: 20 },
    { label: "Lieferant bekannt", ok: !!opts?.supplierKnown, points: 10 },
    { label: "Kein Duplikat", ok: !hasDuplicate(detail), points: 10 },
    { label: "Kontierung vorhanden", ok: !!detail.kontierung?.konto, points: 10 },
  ];

  const score = checks.reduce((s, c) => s + (c.ok ? c.points : 0), 0);
  const tier = score >= 90 ? "high" : score >= 70 ? "medium" : "low";
  const label =
    tier === "high"
      ? "Bereit zur Freigabe"
      : tier === "medium"
        ? "Manuelle Prüfung empfohlen"
        : "Achtung: Mehrere Probleme erkannt";

  return { score, checks, tier, label };
}

export const TIER_COLOR: Record<ConfidenceResult["tier"], string> = {
  high: "#059669",
  medium: "#d97706",
  low: "#dc2626",
};
