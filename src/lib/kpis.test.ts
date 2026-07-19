import { describe, it, expect } from "vitest";
import { normalizeKpis } from "@/lib/api-client";

// Exakte Live-Antwort aus dem Handoff (flach, snake_case).
const LIVE = {
  count_today: 0,
  count_month: 18,
  count_quarter: 18,
  automation_rate: 100.0,
  total_invoices: 35,
  open_approvals: 22,
  oldest_approval: "2026-07-09T05:49:24",
  oldest_age_hours: 247.9,
  anomaly_alerts: 0,
  status_breakdown: { abgelehnt: 3, fehler: 8, freigegeben: 11, pending: 12, verarbeitet: 1 },
  trend: [
    { date: "2026-07-08", count: 5 },
    { date: "2026-07-09", count: 9 },
    { date: "2026-07-11", count: 4 },
  ],
};

describe("normalizeKpis", () => {
  it("maps flat snake_case backend keys to the frontend shape", () => {
    const k = normalizeKpis(LIVE);
    expect(k.rechnungen_monat).toBe(18);
    expect(k.rechnungen_quartal).toBe(18);
    expect(k.automatisierungsquote).toBe(100);
    expect(k.offene_freigaben).toBe(22);
    expect(k.anomalie_alerts).toBe(0);
    expect(k.aelteste_freigabe_stunden).toBe(247.9);
  });

  it("maps trend [{date,count}] -> [{datum,anzahl}]", () => {
    const k = normalizeKpis(LIVE);
    expect(k.trend).toHaveLength(3);
    expect(k.trend[1]).toEqual({ datum: "2026-07-09", anzahl: 9 });
  });

  it("keeps ALL status_breakdown keys (sum matches total)", () => {
    const k = normalizeKpis(LIVE);
    const bd = k.status_breakdown!;
    expect(Object.keys(bd).sort()).toEqual(["abgelehnt", "fehler", "freigegeben", "pending", "verarbeitet"]);
    const sum = Object.values(bd).reduce((s, v) => s + v, 0);
    expect(sum).toBe(35);
  });

  it("is defensive against empty/garbage input", () => {
    const k = normalizeKpis(null);
    expect(k.rechnungen_monat).toBe(0);
    expect(k.trend).toEqual([]);
  });

  it("also accepts an already-German shape (backwards compatible)", () => {
    const k = normalizeKpis({ rechnungen_monat: 7, automatisierungsquote: 42, trend: [{ datum: "2026-07-01", anzahl: 2 }] });
    expect(k.rechnungen_monat).toBe(7);
    expect(k.automatisierungsquote).toBe(42);
    expect(k.trend[0]).toEqual({ datum: "2026-07-01", anzahl: 2 });
  });
});
