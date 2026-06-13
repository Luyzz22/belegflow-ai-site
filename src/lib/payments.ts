// Zahlungsstatus (Client-Side, localStorage) — bis Backend-Endpoint existiert.

const KEY = "flowcheck_paid";

export function getPaidSet(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as number[]) : []);
  } catch {
    return new Set();
  }
}

export function isPaid(id: number): boolean {
  return getPaidSet().has(id);
}

export function setPaid(id: number, paid: boolean) {
  if (typeof window === "undefined") return;
  const set = getPaidSet();
  if (paid) set.add(id);
  else set.delete(id);
  localStorage.setItem(KEY, JSON.stringify([...set]));
}

export function markManyPaid(ids: number[]) {
  if (typeof window === "undefined") return;
  const set = getPaidSet();
  ids.forEach((id) => set.add(id));
  localStorage.setItem(KEY, JSON.stringify([...set]));
}
