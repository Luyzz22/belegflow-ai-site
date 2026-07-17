import type { AppUser, Entitlement, MeResponse } from "@/lib/api-client";

export interface ResolvedEntitlement {
  /** Kein Limit — Admin oder unlimited-Plan. Nie Paywall/Trial anzeigen. */
  unlimited: boolean;
  /** Darf der Nutzer verarbeiten? Bei unlimited immer true. */
  allowed: boolean;
  /** Paywall/Limit-Banner anzeigen? Nur wenn nicht unlimited UND allowed === false. */
  blocked: boolean;
  used: number | null;
  limit: number | null; // null = kein numerisches Limit
  remaining: number | null;
  plan: string | null;
  message: string | null;
}

function toNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Leitet aus /me (user + entitlement) die Anzeige-Entscheidung ab.
 *  Reine Funktion — testbar, ohne React/Netzwerk. */
export function resolveEntitlement(
  input: MeResponse | { user?: AppUser | null; entitlement?: Entitlement | null } | null | undefined
): ResolvedEntitlement {
  const user = input?.user ?? null;
  const ent = input?.entitlement ?? null;

  const unlimited =
    ent?.unlimited === true ||
    ent?.is_admin === true ||
    user?.unlimited === true ||
    user?.is_admin === true;

  // Standard: erlaubt, sofern nicht explizit false. Unlimited immer erlaubt.
  const allowed = unlimited ? true : ent?.allowed !== false;
  const blocked = !unlimited && ent?.allowed === false;

  return {
    unlimited,
    allowed,
    blocked,
    used: unlimited ? null : toNum(ent?.used),
    limit: unlimited ? null : toNum(ent?.limit), // "unlimited" → toNum → null
    remaining: unlimited ? null : toNum(ent?.remaining),
    plan: ent?.plan ?? user?.plan ?? null,
    message: typeof ent?.message === "string" ? ent.message : null,
  };
}
