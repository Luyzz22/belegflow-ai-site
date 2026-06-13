// Zuletzt aufgerufene Rechnungen (Client-Side, localStorage).

export interface RecentInvoice {
  id: number;
  label: string;
}

const KEY = "flowcheck_recent_invoices";
const MAX = 5;

export function getRecents(): RecentInvoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RecentInvoice[]) : [];
  } catch {
    return [];
  }
}

export function pushRecent(item: RecentInvoice) {
  if (typeof window === "undefined" || !item.id) return;
  const list = getRecents().filter((r) => r.id !== item.id);
  list.unshift(item);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
}
