// Maschinen-Aktionscodes des Audit-Logs → lesbare deutsche Labels.
// Rein (keine Imports) — testbar und in api-client wiederverwendbar.

const LABELS: Record<string, string> = {
  upload: "Rechnung hochgeladen",
  ki_extraktion: "KI-Extraktion",
  extraktion: "KI-Extraktion",
  freigabe: "Freigabe erteilt",
  freigabe_erteilt: "Freigabe erteilt",
  freigabe_abgelehnt: "Freigabe abgelehnt",
  ablehnung: "Abgelehnt",
  abgelehnt: "Abgelehnt",
  export: "DATEV-Export",
  datev_export: "DATEV-Export",
  status_geaendert: "Status geändert",
  kontierung: "Kontierung geändert",
  security_incident: "Sicherheitsvorfall",
  login: "Anmeldung",
  logout: "Abmeldung",
};

export function auditActionLabel(action: string | undefined | null): string {
  if (!action) return "Ereignis";
  const key = String(action).toLowerCase();
  if (LABELS[key]) return LABELS[key];
  // Unbekannter Code → aufhübschen (snake/kebab → Wörter, Großbuchstaben).
  return String(action)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
