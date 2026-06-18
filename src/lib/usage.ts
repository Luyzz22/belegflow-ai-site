// Nutzungs-Zähler pro Monat (Client-Side, localStorage) — kein Backend-Enforcement.

import { getPlan, planById } from "@/lib/subscription";

export interface Usage {
  month: string; // "YYYY-MM"
  count: number;
  limit: number | null; // null = unbegrenzt
}

const KEY = "fc_usage";

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function getUsage(): Usage {
  const limit = planById(getPlan()).limit;
  if (typeof window === "undefined") return { month: currentMonth(), count: 0, limit };
  const month = currentMonth();
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Usage>) : null;
    if (parsed && parsed.month === month && typeof parsed.count === "number") {
      return { month, count: parsed.count, limit };
    }
  } catch {
    // ignore
  }
  // Neuer Monat oder keine Daten → zurücksetzen.
  const fresh: Usage = { month, count: 0, limit };
  localStorage.setItem(KEY, JSON.stringify({ month, count: 0 }));
  return fresh;
}

export function incrementUsage(by = 1): Usage {
  const u = getUsage();
  const next = { ...u, count: u.count + by };
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify({ month: next.month, count: next.count }));
  }
  return next;
}

/** True, wenn das Monatslimit erreicht ist (Enterprise = nie). */
export function isLimitReached(u: Usage = getUsage()): boolean {
  return u.limit !== null && u.count >= u.limit;
}
