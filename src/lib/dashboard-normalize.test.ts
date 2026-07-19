import { describe, it, expect } from "vitest";
import { normalizeSuppliers, normalizeAudit } from "@/lib/api-client";
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

  it("empty/garbage input → empty list", () => {
    expect(normalizeSuppliers(null).items).toEqual([]);
    expect(normalizeSuppliers({}).items).toEqual([]);
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

  it("unknown action → prettified label; bad details_json → empty details, no throw", () => {
    const { items } = normalizeAudit(LIVE);
    expect(items[1].aktion_label).toBe("Eskalation Stufe 2");
    expect(items[1].details).toBe("");
  });

  it("auditActionLabel maps known codes and prettifies unknown", () => {
    expect(auditActionLabel("upload")).toBe("Rechnung hochgeladen");
    expect(auditActionLabel("freigabe_erteilt")).toBe("Freigabe erteilt");
    expect(auditActionLabel("some_new_event")).toBe("Some New Event");
    expect(auditActionLabel("")).toBe("Ereignis");
  });
});
