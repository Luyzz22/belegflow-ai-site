import { describe, it, expect } from "vitest";
import { computeConfidence, confidenceSummary } from "@/lib/confidence";
import type { InvoiceDetail } from "@/lib/api-client";

// Minimaler InvoiceDetail-Builder (nur die vom Confidence-Modul gelesenen Felder).
function inv(validierung: InvoiceDetail["validierung"], extra?: Partial<InvoiceDetail>): InvoiceDetail {
  return {
    id: 1,
    lieferant: "AS-Technik / Dipl. Inf. A. Schenk",
    rechnungsnummer: "2025007",
    datum: "2025-10-06",
    betrag: 809.2,
    netto: 680.0,
    ust_betrag: 129.2,
    ust_satz: 19,
    waehrung: "EUR",
    iban: "LT12 1000 0111 0100 1000",
    ust_id: "DE193060196",
    status: "verarbeitet",
    kontierung: { konto: "", gegenkonto: "", steuerschluessel: "" },
    validierung: validierung ?? {},
    anomalien: [],
    created_at: "2025-10-06",
    ...extra,
  } as InvoiceDetail;
}

describe("computeConfidence — backend validierung is the source of truth", () => {
  it("a fully-valid invoice (LT IBAN, Steuernummer) shows 100% and no problems", () => {
    const detail = inv({
      ok: true,
      error_count: 0,
      checks: [
        { name: "iban", ok: true, severity: "error", message: "IBAN gültig (LT)" },
        { name: "ust_idnr_format", ok: true, severity: "error", message: "Steuernummer erkannt" },
        { name: "betrag_summe", ok: true, severity: "error", message: "Summe korrekt" },
        { name: "§14_rechnungsaussteller", ok: true, severity: "error" },
      ],
    });
    const r = computeConfidence(detail, { supplierKnown: false });
    expect(r.tier).toBe("high");
    expect(r.score).toBe(100);
    expect(r.checks.every((c) => c.status === "pass")).toBe(true);
    // Keine "Kontierung vorhanden"-Prüfung, obwohl kontierung leer ist.
    expect(r.checks.some((c) => /kontierung/i.test(c.label))).toBe(false);
    expect(r.checks.some((c) => /IBAN/i.test(c.label) && c.status !== "pass")).toBe(false);
    expect(confidenceSummary(r).tone).toBe("success");
  });

  it("renders only real backend-failed checks with correct severity", () => {
    const detail = inv({
      ok: false,
      error_count: 1,
      checks: [
        { name: "iban", ok: true, severity: "error" },
        { name: "betrag_summe", ok: false, severity: "error", message: "Summe weicht ab" },
        { name: "duplikat", ok: false, severity: "warning", message: "Ähnliche Rechnung" },
      ],
    });
    const r = computeConfidence(detail);
    const fail = r.checks.find((c) => c.id === "betrag_summe")!;
    const warn = r.checks.find((c) => c.id === "duplikat")!;
    expect(fail.status).toBe("fail");
    expect(warn.status).toBe("warn"); // Warnung ist NICHT blockierend
    expect(r.tier).toBe("low");
    // Nur der Fehler zählt als "Problem", nicht die Warnung.
    const summary = confidenceSummary(r);
    expect(summary.tone).toBe("error");
    expect(summary.text).toContain("1 Problem");
  });

  it("no per-check array but error_count>0 → not a false 100%", () => {
    const r = computeConfidence(inv({ ok: false, error_count: 2 }));
    expect(r.tier).toBe("low");
    expect(r.checks[0].status).toBe("fail");
  });

  it("no per-check array but ok:true → clean", () => {
    const r = computeConfidence(inv({ ok: true, error_count: 0 }));
    expect(r.tier).toBe("high");
    expect(r.score).toBe(100);
  });

  it("falls back to legacy only when there is NO backend validation at all", () => {
    // Demo/Legacy: nur iban_valid/ustid_valid, keine checks/ok → Legacy-Pfad.
    const r = computeConfidence(
      inv({ iban_valid: true, ustid_valid: true, pflichtangaben: [] }),
      { supplierKnown: true, supplierCount: 3 }
    );
    // Legacy liefert die alten Label (z. B. IBAN-Prüfung) — Backend-Pfad nicht.
    expect(r.checks.some((c) => c.label === "IBAN-Prüfung")).toBe(true);
  });
});
