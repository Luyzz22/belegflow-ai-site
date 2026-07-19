import { describe, it, expect } from "vitest";
import {
  normalizeSuppliers,
  normalizeAudit,
  deriveSuppliersFromInvoices,
  deriveActivityFromInvoices,
} from "@/lib/api-client";
import { auditActionLabel } from "@/lib/audit";

describe("normalizeSuppliers", () => {
  const LIVE = {
    suppliers: [
      { name: "SBS Deutschland GmbH & Co.KG", count: 3, total: 5640.6, avg: 1880.2, last_date: "2025-09-29", risk_score: 42, risk_label: "mittel", risk_reasons: ["x"] },
    ],
  };

  it("reads the `suppliers` wrapper and maps English keys", () => {
    const { items } = normalizeSuppliers(LIVE);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      name: "SBS Deutschland GmbH & Co.KG",
      anzahl_rechnungen: 3,
      gesamtvolumen: 5640.6,
      durchschnitt: 1880.2,
      letzte_rechnung: "2025-09-29",
      risiko_score: 42,
      risiko_label: "mittel",
    });
  });

  it("tolerates an already-German { items } shape (backwards compatible)", () => {
    const { items } = normalizeSuppliers({ items: [{ name: "A", anzahl_rechnungen: 2, gesamtvolumen: 100 }] });
    expect(items[0].name).toBe("A");
    expect(items[0].anzahl_rechnungen).toBe(2);
    expect(items[0].gesamtvolumen).toBe(100);
  });

  it("finds the supplier array under an unexpected wrapper key or nested data", () => {
    expect(normalizeSuppliers({ lieferanten: [{ name: "Z", count: 1, sum: 50 }] }).items[0].gesamtvolumen).toBe(50);
    expect(normalizeSuppliers({ data: { items: [{ vendor: "Y", invoices: 4, volume: 8 }] } }).items[0]).toMatchObject({
      name: "Y",
      anzahl_rechnungen: 4,
      gesamtvolumen: 8,
    });
    // Unbekannter Wrapper: erstes Array-Feld wird verwendet.
    expect(normalizeSuppliers({ whatever: [{ name: "Q", total: 3 }] }).items[0].name).toBe("Q");
  });

  it("drops entries without a name", () => {
    expect(normalizeSuppliers({ suppliers: [{ count: 5 }, { name: "Ok", count: 1 }] }).items).toHaveLength(1);
  });

  it("empty/garbage input → empty list", () => {
    expect(normalizeSuppliers(null).items).toEqual([]);
    expect(normalizeSuppliers({}).items).toEqual([]);
  });
});

describe("deriveSuppliersFromInvoices", () => {
  const inv = [
    { id: 1, lieferant: "Acme GmbH", rechnungsnummer: "R1", datum: "2025-01-10", betrag: 100, waehrung: "EUR", status: "neu", created_at: "2025-01-10" },
    { id: 2, lieferant: "Acme GmbH", rechnungsnummer: "R2", datum: "2025-03-02", betrag: 300, waehrung: "EUR", status: "neu", created_at: "2025-03-02" },
    { id: 3, lieferant: "Beta AG", rechnungsnummer: "R3", datum: "2025-02-01", betrag: 50, waehrung: "EUR", status: "neu", created_at: "2025-02-01" },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] as any;

  it("aggregates count, total, avg and latest date per supplier", () => {
    const out = deriveSuppliersFromInvoices(inv);
    const acme = out.find((s) => s.name === "Acme GmbH")!;
    expect(acme.anzahl_rechnungen).toBe(2);
    expect(acme.gesamtvolumen).toBe(400);
    expect(acme.durchschnitt).toBe(200);
    expect(acme.letzte_rechnung).toBe("2025-03-02");
    expect(out).toHaveLength(2);
  });

  it("skips blank supplier names", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(deriveSuppliersFromInvoices([{ lieferant: "  ", betrag: 5 }] as any)).toEqual([]);
  });
});

describe("normalizeAudit — tolerant wrappers", () => {
  it("finds entries under `logs` and maps English field variants", () => {
    const { items } = normalizeAudit({
      logs: [{ id: 9, event: "freigabe_erteilt", user: "anna", description: "ok", timestamp: "2026-07-01T10:00:00" }],
    });
    expect(items[0].aktion).toBe("freigabe_erteilt");
    expect(items[0].aktion_label).toBe("Freigabe erteilt");
    expect(items[0].benutzer).toBe("anna");
    expect(items[0].details).toBe("ok");
    expect(items[0].zeitpunkt).toBe("2026-07-01T10:00:00");
  });
});

describe("deriveActivityFromInvoices", () => {
  it("turns invoices into upload events, newest first", () => {
    const inv = [
      { id: 1, lieferant: "Acme", rechnungsnummer: "R1", datum: "", betrag: 1, waehrung: "EUR", status: "neu", created_at: "2025-01-01T09:00:00" },
      { id: 2, lieferant: "Beta", rechnungsnummer: "R2", datum: "", betrag: 1, waehrung: "EUR", status: "neu", created_at: "2025-06-01T09:00:00" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any;
    const out = deriveActivityFromInvoices(inv);
    expect(out[0].aktion_label).toBe("Rechnung hochgeladen");
    expect(out[0].details).toBe("Beta · R2"); // neuestes zuerst
    expect(out[0].zeitpunkt).toBe("2025-06-01T09:00:00");
    expect(out).toHaveLength(2);
  });
});

describe("normalizeAudit", () => {
  const LIVE = {
    total: 42,
    items: [
      { id: 321, tenant_id: 1, user_id: 1, action: "ki_extraktion", entity_type: "invoice", entity_id: "45", details_json: '{"status":"pruefen"}', created_at: "2026-07-17T18:22:10" },
      { id: 322, user_id: 2, action: "eskalation_stufe_2", details_json: "not-json", created_at: "2026-07-17T19:00:00" },
    ],
  };

  it("reads `items`, maps keys, parses details_json, keeps raw action + label", () => {
    const { items, total } = normalizeAudit(LIVE);
    expect(total).toBe(42);
    expect(items[0].aktion).toBe("ki_extraktion"); // Rohcode bleibt
    expect(items[0].aktion_label).toBe("KI-Extraktion"); // Anzeige-Label
    expect(items[0].details).toBe("status: pruefen"); // details_json geparst
    expect(items[0].zeitpunkt).toBe("2026-07-17T18:22:10");
    expect(items[0].entity_type).toBe("invoice");
    expect(items[0].entity_id).toBe("45");
    expect(items[0].benutzer).toBe("Benutzer #1");
  });

  it("unknown action → prettified label; non-JSON details_json → shown verbatim, no throw", () => {
    const { items } = normalizeAudit(LIVE);
    expect(items[1].aktion_label).toBe("Eskalation Stufe 2");
    expect(items[1].details).toBe("not-json"); // kein JSON → Klartext, nicht verworfen
  });

  it("auditActionLabel maps known codes and prettifies unknown", () => {
    expect(auditActionLabel("upload")).toBe("Rechnung hochgeladen");
    expect(auditActionLabel("freigabe_erteilt")).toBe("Freigabe erteilt");
    expect(auditActionLabel("some_new_event")).toBe("Some New Event");
    expect(auditActionLabel("")).toBe("Ereignis");
  });
});
