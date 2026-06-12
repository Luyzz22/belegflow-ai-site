// Skonto-Erkennung aus Zahlungsbedingungen (Client-Side).

export interface SkontoInfo {
  prozent: number;
  tage: number;
  fristMs: number;
  ersparnis: number;
  tageVerbleibend: number;
}

/**
 * Parst z. B. "2% Skonto bei Zahlung innerhalb von 10 Tagen".
 * `now` wird übergeben (keine Date.now()-Aufrufe im Render).
 */
export function parseSkonto(
  zahlungsbedingungen: string | undefined,
  datum: string,
  brutto: number,
  now: number
): SkontoInfo | null {
  if (!zahlungsbedingungen) return null;
  const text = zahlungsbedingungen.toLowerCase();
  if (!text.includes("skonto")) return null;

  const pm = text.match(/(\d+(?:[.,]\d+)?)\s*%/);
  const tm = text.match(/(\d+)\s*tag/);
  if (!pm || !tm) return null;

  const prozent = parseFloat(pm[1].replace(",", "."));
  const tage = parseInt(tm[1], 10);
  const base = Date.parse(datum);
  if (!Number.isFinite(base) || !prozent || !tage) return null;

  const fristMs = base + tage * 86_400_000;
  const ersparnis = (brutto || 0) * (prozent / 100);
  const tageVerbleibend = Math.ceil((fristMs - now) / 86_400_000);
  return { prozent, tage, fristMs, ersparnis, tageVerbleibend };
}
