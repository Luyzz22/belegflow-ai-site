// Automatisierungs-Regeln (Client-Side, localStorage).

export interface AutomationRule {
  id: string;
  name: string;
  wenn: string;
  dann: string;
  enabled: boolean;
  params: { label: string; key: string; value: number; suffix: string }[];
  triggered: number;
}

export const DEFAULT_RULES: AutomationRule[] = [
  {
    id: "auto_freigabe",
    name: "Auto-Freigabe",
    wenn: "Betrag unter Grenze UND KI-Konfidenz über Schwelle",
    dann: "automatisch freigeben",
    enabled: true,
    params: [
      { label: "Betrag unter", key: "betrag", value: 500, suffix: "€" },
      { label: "Konfidenz über", key: "konfidenz", value: 90, suffix: "%" },
    ],
    triggered: 0,
  },
  {
    id: "auto_kontierung",
    name: "Auto-Kontierung",
    wenn: "Lieferant bekannt UND Kontierungs-Historie vorhanden",
    dann: "Kontierung aus Historie übernehmen",
    enabled: true,
    params: [],
    triggered: 0,
  },
  {
    id: "anomalie_eskalation",
    name: "Anomalie-Eskalation",
    wenn: "Betrag über Faktor × Lieferanten-Durchschnitt",
    dann: "an Geschäftsführung eskalieren + E-Mail",
    enabled: false,
    params: [{ label: "Faktor", key: "faktor", value: 3, suffix: "×" }],
    triggered: 0,
  },
  {
    id: "duplikat_block",
    name: "Duplikat-Block",
    wenn: "Duplikat-Verdacht erkannt",
    dann: "Freigabe blockieren + Warnung anzeigen",
    enabled: true,
    params: [],
    triggered: 0,
  },
  {
    id: "skonto_reminder",
    name: "Skonto-Reminder",
    wenn: "Skonto-Frist unter Schwelle UND unbezahlt",
    dann: "Dashboard-Alert + Badge auf Zahlungen-Seite",
    enabled: true,
    params: [{ label: "Frist unter", key: "tage", value: 3, suffix: "Tage" }],
    triggered: 0,
  },
];

const KEY = "fc_automation_rules";

export function getRules(): AutomationRule[] {
  if (typeof window === "undefined") return DEFAULT_RULES;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_RULES;
    const saved = JSON.parse(raw) as AutomationRule[];
    // Mit Defaults zusammenführen (neue Regeln ergänzen).
    return DEFAULT_RULES.map((d) => saved.find((s) => s.id === d.id) ?? d);
  } catch {
    return DEFAULT_RULES;
  }
}

export function saveRules(list: AutomationRule[]) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(list));
}
