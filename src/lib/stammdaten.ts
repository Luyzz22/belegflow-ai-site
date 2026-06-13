// Stammdaten (Client-Side, localStorage): Kontenplan, Kostenstellen, Lieferanten.

export interface Konto {
  konto: string;
  bezeichnung: string;
  typ: string;
}

export interface Kostenstelle {
  nr: string;
  bezeichnung: string;
}

export interface LieferantStamm {
  konto?: string;
  kostenstelle?: string;
  zahlungsziel?: number; // Tage
  skonto?: string;
  ansprechpartner?: string;
  notizen?: string;
}

export const DEFAULT_KONTENPLAN: Konto[] = [
  { konto: "4400", bezeichnung: "Aufwendungen für bezogene Leistungen", typ: "Aufwand" },
  { konto: "4900", bezeichnung: "Fremdleistungen", typ: "Aufwand" },
  { konto: "6300", bezeichnung: "Bürobedarf", typ: "Aufwand" },
  { konto: "1200", bezeichnung: "Forderungen", typ: "Aktiv" },
  { konto: "1800", bezeichnung: "Bank", typ: "Aktiv" },
];

export const DEFAULT_KOSTENSTELLEN: Kostenstelle[] = [
  { nr: "100", bezeichnung: "Geschäftsführung" },
  { nr: "200", bezeichnung: "Vertrieb" },
  { nr: "300", bezeichnung: "Entwicklung" },
  { nr: "400", bezeichnung: "Verwaltung" },
];

export const DEFAULT_ZAHLUNGSZIEL = 30;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getKontenplan(): Konto[] {
  return read("flowcheck_kontenplan", DEFAULT_KONTENPLAN);
}
export function saveKontenplan(list: Konto[]) {
  if (typeof window !== "undefined") localStorage.setItem("flowcheck_kontenplan", JSON.stringify(list));
}

export function getKostenstellen(): Kostenstelle[] {
  return read("flowcheck_kostenstellen", DEFAULT_KOSTENSTELLEN);
}
export function saveKostenstellen(list: Kostenstelle[]) {
  if (typeof window !== "undefined") localStorage.setItem("flowcheck_kostenstellen", JSON.stringify(list));
}

export function getLieferantStamm(name: string): LieferantStamm {
  if (!name) return {};
  return read(`stammdaten_${name}`, {} as LieferantStamm);
}
export function saveLieferantStamm(name: string, data: LieferantStamm) {
  if (typeof window !== "undefined" && name) localStorage.setItem(`stammdaten_${name}`, JSON.stringify(data));
}

export function zahlungszielFor(name: string): number {
  return getLieferantStamm(name).zahlungsziel ?? DEFAULT_ZAHLUNGSZIEL;
}
