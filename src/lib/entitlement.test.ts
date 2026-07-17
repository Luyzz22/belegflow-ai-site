import { describe, it, expect } from "vitest";
import { resolveEntitlement } from "@/lib/entitlement";

describe("resolveEntitlement", () => {
  it("admin/unlimited: no paywall, never blocked", () => {
    const r = resolveEntitlement({
      user: { id: 1, email: "a@b.de", role: "admin", is_admin: true },
      entitlement: { plan: "admin", is_admin: true, unlimited: true, allowed: true, limit: "unlimited", used: 0, remaining: "unlimited" },
    });
    expect(r.unlimited).toBe(true);
    expect(r.allowed).toBe(true);
    expect(r.blocked).toBe(false);
    expect(r.limit).toBeNull(); // "unlimited" → kein numerisches Limit
  });

  it("unlimited flag alone (no is_admin) still unlimited", () => {
    const r = resolveEntitlement({
      user: { id: 2, email: "u@b.de", role: "user" },
      entitlement: { plan: "enterprise", unlimited: true, allowed: true },
    });
    expect(r.unlimited).toBe(true);
    expect(r.blocked).toBe(false);
  });

  it("normal active plan: real used/limit, not blocked", () => {
    const r = resolveEntitlement({
      user: { id: 3, email: "p@b.de", role: "user" },
      entitlement: { plan: "professional", unlimited: false, allowed: true, limit: 500, used: 31, remaining: 469 },
    });
    expect(r.unlimited).toBe(false);
    expect(r.allowed).toBe(true);
    expect(r.blocked).toBe(false);
    expect(r.used).toBe(31);
    expect(r.limit).toBe(500);
    expect(r.remaining).toBe(469);
  });

  it("allowed=false: blocked → banner shown", () => {
    const r = resolveEntitlement({
      user: { id: 4, email: "x@b.de", role: "user" },
      entitlement: { plan: "starter", unlimited: false, allowed: false, limit: 100, used: 100, remaining: 0, message: "Limit erreicht." },
    });
    expect(r.blocked).toBe(true);
    expect(r.allowed).toBe(false);
    expect(r.message).toBe("Limit erreicht.");
  });

  it("no entitlement: defaults to allowed, not unlimited, no numbers", () => {
    const r = resolveEntitlement({ user: { id: 5, email: "n@b.de", role: "user" }, entitlement: null });
    expect(r.unlimited).toBe(false);
    expect(r.allowed).toBe(true);
    expect(r.blocked).toBe(false);
    expect(r.limit).toBeNull();
    expect(r.used).toBeNull();
  });

  it("null input is safe", () => {
    const r = resolveEntitlement(null);
    expect(r.unlimited).toBe(false);
    expect(r.blocked).toBe(false);
  });
});
