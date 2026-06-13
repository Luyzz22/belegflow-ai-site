import type { InvoiceListItem, DashboardKpis } from "@/lib/api-client";
import { eur, num } from "@/lib/format";
import { zahlungszielFor } from "@/lib/stammdaten";

export type RecTone = "money" | "warning" | "info";

export interface Recommendation {
  id: string;
  tone: RecTone;
  icon: "money" | "warning" | "insight" | "shield" | "bolt";
  title: string;
  text: string;
  cta: { label: string; href: string };
}

const DAY = 86_400_000;

/** Client-seitige proaktive Empfehlungen aus den vorhandenen Daten. */
export function buildRecommendations(args: {
  invoices: InvoiceListItem[];
  kpis: DashboardKpis | null;
  paidSet: Set<number>;
  now: number;
}): Recommendation[] {
  const { invoices, kpis, paidSet, now } = args;
  const recs: Recommendation[] = [];

  // 1) Fällige Zahlungen diese Woche (zeitkritisch / Geld)
  const dueSoon = invoices.filter((i) => {
    if (paidSet.has(i.id)) return false;
    const base = Date.parse(i.datum || i.created_at || "");
    if (!Number.isFinite(base)) return false;
    const due = base + zahlungszielFor(i.lieferant) * DAY;
    return due >= now && due - now <= 7 * DAY;
  });
  if (dueSoon.length > 0) {
    const sum = dueSoon.reduce((s, i) => s + (i.betrag || 0), 0);
    recs.push({
      id: "zahlung",
      tone: "money",
      icon: "money",
      title: "Zahlungen diese Woche fällig",
      text: `${num(dueSoon.length)} Rechnung(en) im Wert von ${eur(sum)} sind in den nächsten 7 Tagen fällig.`,
      cta: { label: "Zahlungen öffnen", href: "/zahlungen" },
    });
  }

  // 2) Anomalie: größter Ausreißer
  if (invoices.length >= 3) {
    const avg = invoices.reduce((s, i) => s + (i.betrag || 0), 0) / invoices.length;
    if (avg > 0) {
      const max = invoices.reduce((a, b) => ((b.betrag || 0) > (a.betrag || 0) ? b : a));
      if ((max.betrag || 0) >= avg * 2.5) {
        recs.push({
          id: "anomalie",
          tone: "warning",
          icon: "warning",
          title: "Anomalie erkannt",
          text: `${max.rechnungsnummer || `#${max.id}`} von ${max.lieferant}: Betrag ist ${Math.round(((max.betrag || 0) / avg) * 100)}% des Durchschnitts (${eur(max.betrag)} vs. Ø ${eur(avg)}).`,
          cta: { label: "Prüfen", href: `/rechnungen/${max.id}` },
        });
      }
    }
  }

  // 3) Lieferanten-Insight: hohe Frequenz
  const freq = new Map<string, number>();
  invoices.forEach((i) => {
    const base = Date.parse(i.datum || i.created_at || "");
    if (Number.isFinite(base) && now - base <= 7 * DAY) {
      freq.set(i.lieferant, (freq.get(i.lieferant) || 0) + 1);
    }
  });
  const hot = [...freq.entries()].find(([, c]) => c >= 3);
  if (hot) {
    recs.push({
      id: "frequenz",
      tone: "info",
      icon: "insight",
      title: "Ungewöhnliche Frequenz",
      text: `${hot[0]}: ${hot[1]} Rechnungen in 7 Tagen — höher als üblich.`,
      cta: { label: "Lieferant ansehen", href: `/lieferanten/${encodeURIComponent(hot[0])}` },
    });
  }

  // 4) Prozess: offene Freigaben
  if ((kpis?.offene_freigaben ?? 0) > 0) {
    const alt = kpis?.aelteste_freigabe_stunden;
    recs.push({
      id: "prozess",
      tone: "info",
      icon: "bolt",
      title: "Freigaben beschleunigen",
      text:
        alt != null && alt > 0
          ? `${num(kpis?.offene_freigaben ?? 0)} offene Freigabe(n), älteste seit ${Math.round(alt)} h. Mit dem Review-Modus in Sekunden erledigt.`
          : `${num(kpis?.offene_freigaben ?? 0)} Rechnung(en) warten auf Freigabe. Mit dem Review-Modus in Sekunden erledigt.`,
      cta: { label: "Review starten", href: "/review" },
    });
  }

  // Priorität: Geld > Warnung > Info
  const order: RecTone[] = ["money", "warning", "info"];
  return recs.sort((a, b) => order.indexOf(a.tone) - order.indexOf(b.tone));
}

const DISMISS_KEY = "flowcheck_dismissed_recs";

export function getDismissed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function dismissRec(id: string) {
  if (typeof window === "undefined") return;
  const list = getDismissed();
  if (!list.includes(id)) localStorage.setItem(DISMISS_KEY, JSON.stringify([...list, id]));
}
