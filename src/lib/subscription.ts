// Abonnement & Testphase (Client-Side, localStorage) — UI-only bis Stripe aktiv ist.

export type PlanId = "starter" | "professional" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // € / Monat
  limit: number | null; // Rechnungen / Monat, null = unbegrenzt
  recommended?: boolean;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 99,
    limit: 100,
    features: [
      "Bis zu 100 Rechnungen / Monat",
      "KI-Extraktion & §14-UStG-Prüfung",
      "DATEV-Export (EXTF 700)",
      "E-Mail-Support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 349,
    limit: 500,
    recommended: true,
    features: [
      "Bis zu 500 Rechnungen / Monat",
      "Mehrstufige Freigabe-Workflows",
      "Analytics & Cash-Flow-Prognose",
      "Mehrbenutzer & Rollen",
      "Prioritäts-Support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 999,
    limit: null,
    features: [
      "Unbegrenzte Rechnungen",
      "Multi-Mandanten-Verwaltung",
      "API-Zugang & Webhooks",
      "SLA & dedizierter Ansprechpartner",
      "On-Premise-Option",
    ],
  },
];

export const TRIAL_DAYS = 14;
const TRIAL_KEY = "fc_trial_start";
const PLAN_KEY = "fc_plan";

export function planById(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

/** Beginn der Testphase (ms). Wird beim ersten Aufruf gesetzt, falls nicht vorhanden. */
export function getTrialStart(): number {
  if (typeof window === "undefined") return Date.now();
  const raw = localStorage.getItem(TRIAL_KEY);
  if (raw) {
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }
  const now = Date.now();
  localStorage.setItem(TRIAL_KEY, String(now));
  return now;
}

export function trialDaysLeft(now: number = Date.now()): number {
  const elapsed = now - getTrialStart();
  const left = TRIAL_DAYS - Math.floor(elapsed / 86_400_000);
  return Math.max(0, left);
}

/** Aktiver Plan (Standard: starter). Während der Testphase gilt der Starter-Umfang. */
export function getPlan(): PlanId {
  if (typeof window === "undefined") return "starter";
  const raw = localStorage.getItem(PLAN_KEY) as PlanId | null;
  return raw && PLANS.some((p) => p.id === raw) ? raw : "starter";
}

export function setPlan(id: PlanId) {
  if (typeof window !== "undefined") localStorage.setItem(PLAN_KEY, id);
}
