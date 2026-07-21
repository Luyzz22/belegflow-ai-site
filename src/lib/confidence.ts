import type { InvoiceDetail, ValidationCheck } from "@/lib/api-client";
import { eur } from "@/lib/format";

export type CheckStatus = "pass" | "warn" | "fail";
export type CheckAction = "fields" | "kontierung";

export interface ConfidenceCheck {
  id: string;
  label: string;
  maxPoints: number;
  earnedPoints: number;
  status: CheckStatus;
  detail: string;
  hint?: string;
  action?: CheckAction;
}

export interface ConfidenceResult {
  score: number; // 0–100
  tier: "high" | "medium" | "low";
  checks: ConfidenceCheck[];
}

export const TIER_COLOR: Record<ConfidenceResult["tier"], string> = {
  high: "#059669",
  medium: "#d97706",
  low: "#dc2626",
};

export const TIER_LABEL: Record<ConfidenceResult["tier"], string> = {
  high: "Bereit zur Freigabe",
  medium: "Manuelle Prüfung empfohlen",
  low: "Mehrere Probleme erkannt",
};

function isFilled(v: string | undefined | null): boolean {
  return !!v && v.trim() !== "" && v.trim() !== "-";
}

function hasDuplicate(detail: InvoiceDetail): boolean {
  return (detail.anomalien ?? []).some((a) => {
    const text = (typeof a === "string" ? a : `${a.typ ?? ""} ${a.beschreibung ?? ""}`).toLowerCase();
    return text.includes("duplik") || text.includes("dublet");
  });
}

type ConfidenceOpts = {
  supplierKnown?: boolean;
  supplierCount?: number;
  kontierungHistoryCount?: number;
  duplicate?: { rechnungsnummer: string; datum: string } | null;
};

// ── Backend-Validierung als Quelle der Wahrheit ──────────────────────
// Wenn das Backend strukturierte Validierung liefert (validierung.checks
// bzw. .ok/.error_count), wird AUSSCHLIESSLICH diese gerendert — KEINE
// clientseitige Neuvalidierung von IBAN/USt/Kontierung.

function prettifyCheckName(name: string): string {
  return name
    .replace(/^§?14[_ ]?/i, "§14 ")
    .replace(/_/g, " ")
    .replace(/\bidnr\b/i, "IdNr.")
    .replace(/\bust\b/i, "USt")
    .replace(/\biban\b/i, "IBAN")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function checkPassed(c: ValidationCheck): boolean {
  if (typeof c.ok === "boolean") return c.ok;
  if (typeof c.passed === "boolean") return c.passed;
  if (typeof c.valid === "boolean") return c.valid;
  if (typeof c.vorhanden === "boolean") return c.vorhanden;
  if (typeof c.status === "string") {
    const s = c.status.toLowerCase();
    if (/(fail|error|fehl|ungültig|ungueltig|invalid)/.test(s)) return false;
    if (/(ok|pass|valid|gültig|gueltig|bestanden)/.test(s)) return true;
  }
  return true; // im Zweifel KEIN Fehler erfinden
}

type Severity = "error" | "warning" | "info";
function checkSeverity(c: ValidationCheck): Severity {
  const s = `${c.severity ?? ""} ${c.status ?? ""}`.toLowerCase();
  if (/(warn|hinweis)/.test(s)) return "warning";
  if (/(info)/.test(s)) return "info";
  return "error"; // Default für fehlgeschlagene Checks: blockierend
}

/** ConfidenceResult strikt aus der strukturierten Backend-Validierung. */
function fromBackendValidierung(detail: InvoiceDetail): ConfidenceResult {
  const v = detail.validierung;
  const raw = (v?.checks ?? []).filter((c): c is ValidationCheck => !!c && typeof c === "object");

  // Kein Check-Array, aber ok/error_count vorhanden → einen Summen-Check bilden,
  // damit eine fehlerhafte Rechnung nicht fälschlich als 100 % erscheint.
  if (raw.length === 0) {
    const errCount = typeof v?.error_count === "number" ? v.error_count : v?.ok === false ? 1 : 0;
    if (errCount > 0) {
      return {
        score: 60,
        tier: "low",
        checks: [
          {
            id: "validierung",
            label: "Backend-Validierung",
            maxPoints: 10,
            earnedPoints: 0,
            status: "fail",
            detail: `${errCount} ${errCount === 1 ? "Prüfung" : "Prüfungen"} nicht bestanden`,
            hint: "Im Beleg prüfen und korrigieren.",
          },
        ],
      };
    }
    // ok === true (oder error_count 0) und keine Detail-Checks → alles in Ordnung.
    return {
      score: 100,
      tier: "high",
      checks: [
        {
          id: "validierung",
          label: "Backend-Validierung",
          maxPoints: 10,
          earnedPoints: 10,
          status: "pass",
          detail: "Alle Pflichtprüfungen bestanden",
        },
      ],
    };
  }

  const checks: ConfidenceCheck[] = raw.map((c, i) => {
    const passed = checkPassed(c);
    const severity = passed ? "info" : checkSeverity(c);
    const status: CheckStatus = passed ? "pass" : severity === "error" ? "fail" : "warn";
    const label = c.label || prettifyCheckName(c.name || c.feld || c.field || `Prüfung ${i + 1}`);
    const message =
      c.message ||
      c.text ||
      (passed ? "Geprüft und in Ordnung" : status === "warn" ? "Hinweis — bitte prüfen" : "Prüfung fehlgeschlagen");
    return {
      id: c.name || c.feld || c.field || `check_${i}`,
      label,
      maxPoints: 10,
      earnedPoints: status === "pass" ? 10 : status === "warn" ? 5 : 0,
      status,
      detail: message,
      hint: status === "fail" ? "Im Beleg prüfen und korrigieren." : undefined,
    };
  });

  const errorFails = checks.filter((c) => c.status === "fail").length;
  const warnFails = checks.filter((c) => c.status === "warn").length;

  // Score/Tier ausschließlich aus fehlgeschlagenen Checks (Fehler > Warnung).
  // Eine vollständig valide Rechnung => 100 %, keine Probleme.
  const tier: ConfidenceResult["tier"] = errorFails > 0 ? "low" : warnFails > 0 ? "medium" : "high";
  let score = 100 - errorFails * 30 - warnFails * 8;
  if (tier === "low") score = Math.min(score, 65);
  else if (tier === "medium") score = Math.max(70, Math.min(score, 92));
  score = Math.max(0, Math.min(100, score));

  return { score, tier, checks };
}

/**
 * Konfidenz-Score (0–100). Bevorzugt IMMER die strukturierte Backend-Validierung
 * (validierung.checks / .ok / .error_count). Nur wenn diese fehlt (Demo/Legacy)
 * wird der clientseitige Fallback verwendet.
 */
export function computeConfidence(detail: InvoiceDetail, opts?: ConfidenceOpts): ConfidenceResult {
  const v = detail?.validierung;
  const hasBackendValidation =
    !!v && (Array.isArray(v.checks) || typeof v.ok === "boolean" || typeof v.error_count === "number");
  if (hasBackendValidation) return fromBackendValidierung(detail);
  return legacyConfidence(detail, opts);
}

/** Fallback für Demo-/Legacy-Daten ohne strukturierte Backend-Validierung. */
function legacyConfidence(detail: InvoiceDetail, opts?: ConfidenceOpts): ConfidenceResult {
  const checks: ConfidenceCheck[] = [];

  // 1) §14 Pflichtangaben (+20)
  const required: { name: string; ok: boolean }[] = [
    { name: "Rechnungsaussteller", ok: isFilled(detail.lieferant) },
    { name: "Rechnungsnummer", ok: isFilled(detail.rechnungsnummer) },
    { name: "Datum", ok: isFilled(detail.datum) },
    { name: "Betrag", ok: (detail.betrag || 0) > 0 },
    { name: "USt", ok: (detail.ust_betrag || 0) > 0 || detail.ust_satz === 0 },
  ];
  const missing = required.filter((r) => !r.ok).map((r) => r.name);
  const pflichtOk = missing.length === 0;
  checks.push({
    id: "pflichtangaben",
    label: "§14 Pflichtangaben",
    maxPoints: 20,
    earnedPoints: pflichtOk ? 20 : 0,
    status: pflichtOk ? "pass" : "fail",
    detail: pflichtOk ? "Alle 5 Pflichtfelder vorhanden" : `Fehlend: ${missing.join(", ")}`,
    hint: pflichtOk ? undefined : "Felder im Bearbeitungsmodus ergänzen.",
    action: pflichtOk ? undefined : "fields",
  });

  // 2) IBAN (+15)
  const ibanFilled = isFilled(detail.iban);
  const ibanValid = !!detail.validierung?.iban_valid;
  checks.push({
    id: "iban",
    label: "IBAN-Prüfung",
    maxPoints: 15,
    earnedPoints: ibanValid ? 15 : 0,
    status: ibanValid ? "pass" : "fail",
    detail: ibanValid
      ? "IBAN geprüft und gültig"
      : ibanFilled
        ? "IBAN-Prüfziffer ungültig. Bitte überprüfen."
        : "Keine IBAN vorhanden. Bitte manuell ergänzen.",
    hint: ibanValid ? undefined : "IBAN ergänzen",
    action: ibanValid ? undefined : "fields",
  });

  // 3) USt-ID (+15)
  const ustidFilled = isFilled(detail.ust_id);
  const ustidValid = !!detail.validierung?.ustid_valid;
  checks.push({
    id: "ustid",
    label: "USt-ID-Prüfung",
    maxPoints: 15,
    earnedPoints: ustidValid ? 15 : 0,
    status: ustidValid ? "pass" : "fail",
    detail: ustidValid
      ? "USt-IdNr. Format korrekt"
      : ustidFilled
        ? "USt-IdNr. ungültig. Bitte überprüfen."
        : "Keine USt-IdNr. vorhanden.",
    hint: ustidValid ? undefined : "USt-ID ergänzen",
    action: ustidValid ? undefined : "fields",
  });

  // 4) Betragscheck (+20)
  const netto = detail.netto || 0;
  const ust = detail.ust_betrag || 0;
  const brutto = detail.betrag || 0;
  const amountsIncomplete = brutto > 0 && netto === 0 && ust === 0;
  const summeOk = !amountsIncomplete && Math.abs(netto + ust - brutto) <= 0.01;
  checks.push({
    id: "betrag",
    label: "Betragscheck",
    maxPoints: 20,
    earnedPoints: summeOk ? 20 : 0,
    status: summeOk ? "pass" : amountsIncomplete ? "warn" : "fail",
    detail: summeOk
      ? `${eur(netto, detail.waehrung)} + ${eur(ust, detail.waehrung)} = ${eur(brutto, detail.waehrung)}`
      : amountsIncomplete
        ? "Betragsangaben unvollständig"
        : `Summe stimmt nicht: ${eur(netto, detail.waehrung)} + ${eur(ust, detail.waehrung)} ≠ ${eur(brutto, detail.waehrung)}`,
  });

  // 5) Lieferant bekannt (+10)
  const supplierKnown = !!opts?.supplierKnown;
  const count = opts?.supplierCount ?? 0;
  checks.push({
    id: "lieferant",
    label: "Lieferant bekannt?",
    maxPoints: 10,
    earnedPoints: supplierKnown ? 10 : 0,
    status: supplierKnown ? "pass" : "warn",
    detail: supplierKnown
      ? `Bekannter Lieferant${count > 0 ? ` (${count} bisherige Rechnungen)` : ""}`
      : "Erste Rechnung dieses Lieferanten",
    hint: supplierKnown ? undefined : "Wird nach 2+ Rechnungen automatisch grün.",
  });

  // 6) Kein Duplikat (+10)
  const dupMatch = opts?.duplicate ?? null;
  const dup = !!dupMatch || hasDuplicate(detail);
  checks.push({
    id: "duplikat",
    label: "Kein Duplikat",
    maxPoints: 10,
    earnedPoints: dup ? 0 : 10,
    status: dup ? "warn" : "pass",
    detail: dupMatch
      ? `Ähnliche Rechnung gefunden (${dupMatch.rechnungsnummer} vom ${
          dupMatch.datum ? new Date(dupMatch.datum).toLocaleDateString("de-DE") : "—"
        })`
      : dup
        ? "Mögliches Duplikat erkannt."
        : "Keine identische Rechnung gefunden.",
  });

  // 7) Kontierung (+10)
  const kontoOk = isFilled(detail.kontierung?.konto);
  checks.push({
    id: "kontierung",
    label: "Kontierung vorhanden",
    maxPoints: 10,
    earnedPoints: kontoOk ? 10 : 0,
    status: kontoOk ? "pass" : "fail",
    detail: kontoOk
      ? `${detail.kontierung?.konto} → ${detail.kontierung?.gegenkonto || "—"}, SK ${detail.kontierung?.steuerschluessel || "—"}`
      : "Keine Kontierung vorgeschlagen",
    hint: kontoOk ? undefined : "Kontierung im Tab „Kontierung“ ergänzen.",
    action: kontoOk ? undefined : "kontierung",
  });

  // 8) Bonus: Kontierung aus Historie (+5)
  const histCount = opts?.kontierungHistoryCount ?? 0;
  if (histCount > 0) {
    checks.push({
      id: "kontierung_historie",
      label: "Kontierung aus Historie",
      maxPoints: 5,
      earnedPoints: 5,
      status: "pass",
      detail: `Kontierung basiert auf ${histCount} vorherigen Buchungen`,
    });
  }

  const score = Math.min(100, checks.reduce((s, c) => s + c.earnedPoints, 0));
  const tier = score >= 90 ? "high" : score >= 70 ? "medium" : "low";
  return { score, tier, checks };
}

/** Banner-Zusammenfassung aus den tatsächlich fehlgeschlagenen/warnenden Checks. */
export function confidenceSummary(result: ConfidenceResult): {
  tone: "success" | "warning" | "error";
  text: string;
} {
  if (result.tier === "high") {
    return { tone: "success", text: "Alle Prüfungen bestanden" };
  }
  const issues = result.checks.filter((c) => c.status !== "pass");
  const labels = issues.map((c) => c.detail.split(".")[0]);
  if (result.tier === "medium") {
    const n = issues.length;
    return { tone: "warning", text: `${n} ${n === 1 ? "Hinweis" : "Hinweise"}: ${labels.join(", ")}` };
  }
  const fails = result.checks.filter((c) => c.status === "fail");
  const n = fails.length;
  return {
    tone: "error",
    text: `${n} ${n === 1 ? "Problem" : "Probleme"}: ${fails.map((c) => c.label).join(", ")}`,
  };
}
