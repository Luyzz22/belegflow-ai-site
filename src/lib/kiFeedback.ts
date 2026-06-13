// KI-Extraktions-Feedback (Client-Side, localStorage).

export interface KiFeedback {
  id: number;
  ok: boolean;
  ts: number;
}

const KEY = "flowcheck_ki_feedback";

function read(): KiFeedback[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as KiFeedback[]) : [];
  } catch {
    return [];
  }
}

export function recordFeedback(id: number, ok: boolean) {
  if (typeof window === "undefined" || !id) return;
  const list = read().filter((f) => f.id !== id);
  list.push({ id, ok, ts: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getFeedbackFor(id: number): boolean | null {
  const f = read().find((x) => x.id === id);
  return f ? f.ok : null;
}

/** Aggregierte KI-Genauigkeit über alle bewerteten Rechnungen. */
export function getAccuracy(): { pct: number; count: number } {
  const list = read();
  if (list.length === 0) return { pct: 0, count: 0 };
  const ok = list.filter((f) => f.ok).length;
  return { pct: Math.round((ok / list.length) * 100), count: list.length };
}
