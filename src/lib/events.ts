// Minimaler Daten-Invalidierungs-Bus (Client-seitig).
// Wird nach Aktionen ausgelöst, die serverseitige Zähler verändern
// (Upload, Freigabe erteilt/abgelehnt), damit z. B. die Sidebar-Badges
// sofort neu laden statt bis zur nächsten Navigation zu veralten.

export const FLOWCHECK_DATA_CHANGED = "flowcheck:data-changed";

/** Signalisiert allen Zuhörern, dass sich Rechnungs-/Freigabe-Daten geändert
 *  haben (No-op im SSR). */
export function notifyDataChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(FLOWCHECK_DATA_CHANGED));
  }
}
