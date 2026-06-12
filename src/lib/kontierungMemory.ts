// Gelernte Kontierung pro Lieferant (Client-Side, localStorage).

export interface KontierungMemory {
  konto: string;
  gegenkonto: string;
  steuerschluessel: string;
  count: number;
}

function key(name: string) {
  return `kontierung_${name}`;
}

export function getKontierungMemory(name: string): KontierungMemory | null {
  if (typeof window === "undefined" || !name) return null;
  try {
    const raw = localStorage.getItem(key(name));
    return raw ? (JSON.parse(raw) as KontierungMemory) : null;
  } catch {
    return null;
  }
}

export function recordKontierung(
  name: string,
  k: { konto: string; gegenkonto: string; steuerschluessel: string }
) {
  if (typeof window === "undefined" || !name) return;
  const prev = getKontierungMemory(name);
  const count = (prev?.count ?? 0) + 1;
  localStorage.setItem(key(name), JSON.stringify({ ...k, count }));
}
