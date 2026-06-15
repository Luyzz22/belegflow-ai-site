// Kontierungs-Vorlagen (Client-Side, localStorage).

export interface KontierungsVorlage {
  id: string;
  emoji: string;
  name: string;
  konto: string;
  gegenkonto: string;
  steuerschluessel: string;
  fuer: string;
}

export const DEFAULT_TEMPLATES: KontierungsVorlage[] = [
  { id: "buero", emoji: "🏢", name: "Büromaterial", konto: "6300", gegenkonto: "1200", steuerschluessel: "9", fuer: "Bürobedarf, Druckerpatronen, Papier" },
  { id: "it", emoji: "💻", name: "IT & Software", konto: "6500", gegenkonto: "1200", steuerschluessel: "9", fuer: "Lizenzen, Cloud-Services, Hardware" },
  { id: "reise", emoji: "🚗", name: "Reisekosten", konto: "6670", gegenkonto: "1200", steuerschluessel: "9", fuer: "Hotel, Bahn, Flug, Taxi" },
  { id: "fremd", emoji: "🏗️", name: "Fremdleistungen", konto: "4900", gegenkonto: "1200", steuerschluessel: "9", fuer: "Beratung, Entwicklung, Dienstleistungen" },
];

const KEY = "fc_templates";

export function getTemplates(): KontierungsVorlage[] {
  if (typeof window === "undefined") return DEFAULT_TEMPLATES;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as KontierungsVorlage[]) : DEFAULT_TEMPLATES;
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

export function saveTemplates(list: KontierungsVorlage[]) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(list));
}
