import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flowcheckApi, normalizeFreigaben } from "@/lib/api-client";

describe("normalizeFreigaben", () => {
  const LIVE = {
    items: [
      {
        request_id: 1,
        invoice_id: 23,
        amount: 29.0,
        current_stage: 0,
        required_role: "Sachbearbeiter",
        status: "offen",
        escalated: 1,
        created_at: "2026-07-09T05:49:24",
        rechnungsnummer: "01-21-invoice-2886089",
        rechnungsaussteller: "Qonto (Olinda SAS)",
        age_hours: 298.7,
        overdue: true,
      },
    ],
  };

  it("maps the live shape and exposes request_id (distinct from invoice_id)", () => {
    const { items } = normalizeFreigaben(LIVE);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      request_id: 1,
      invoice_id: 23,
      betrag: 29,
      lieferant: "Qonto (Olinda SAS)",
      rechnungsnummer: "01-21-invoice-2886089",
      stufe: "Sachbearbeiter",
      required_role: "Sachbearbeiter",
      status: "offen",
      overdue: true,
      escalated: true,
    });
    expect(items[0].age_hours).toBeCloseTo(298.7);
    expect(items[0].request_id).not.toBe(items[0].invoice_id);
  });

  it("drops entries without a request_id (not approvable)", () => {
    expect(normalizeFreigaben({ items: [{ invoice_id: 5, amount: 1 }] }).items).toEqual([]);
  });
});

describe("approve/reject target the request_id", () => {
  type Call = { url: string; init: RequestInit };
  let calls: Call[];

  beforeEach(() => {
    calls = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit) => {
        calls.push({ url: String(url), init });
        return {
          ok: true,
          status: 200,
          json: async () => ({ ok: true, status: "freigegeben", final: true }),
        } as Response;
      })
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it("POSTs /freigaben/{request_id}/approve — request_id 1, never invoice_id 23", async () => {
    const res = await flowcheckApi.approve(1); // request_id, invoice was 23
    expect(res).toMatchObject({ ok: true, status: "freigegeben", final: true });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toContain("/freigaben/1/approve");
    expect(calls[0].url).not.toContain("/23/");
    expect(calls[0].init.method).toBe("POST");
  });

  it("POSTs /freigaben/{request_id}/reject with a grund body", async () => {
    await flowcheckApi.reject(1, "Betrag falsch");
    expect(calls[0].url).toContain("/freigaben/1/reject");
    expect(JSON.parse(String(calls[0].init.body))).toEqual({ grund: "Betrag falsch" });
  });

  it("advances a stage: status 'offen' + final false is returned to the caller", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ ok: true, status: "offen", final: false, next_role: "Teamleiter" }),
      } as Response))
    );
    const res = await flowcheckApi.approve(1);
    expect(res).toMatchObject({ status: "offen", final: false, next_role: "Teamleiter" });
  });

  it("surfaces the server detail message on non-2xx instead of a silent failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 400,
        json: async () => ({ detail: "Keine offene Freigabe für diese Rechnung" }),
      } as Response))
    );
    await expect(flowcheckApi.approve(99)).rejects.toThrow("Keine offene Freigabe für diese Rechnung");
  });
});
