// Protokollierung von Datenexporten (GoBD-konform, clientseitig).
// Jeder Export erhält einen Zeitstempel und eine Prüfsumme zur Nachvollziehbarkeit.

export interface ExportEntry {
  type: string;
  count: number;
  timestamp: string;
  hash: string;
}

const KEY = "fc_exports";

/** Deterministische, nicht-kryptografische Prüfsumme (djb2) für den Nachweis. */
function checksum(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, "0");
}

export function loadExports(): ExportEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as ExportEntry[];
  } catch {
    return [];
  }
}

export function recordExport(type: string, count: number): ExportEntry {
  const timestamp = new Date().toISOString();
  const entry: ExportEntry = { type, count, timestamp, hash: checksum(`${type}:${count}:${timestamp}`) };
  if (typeof window !== "undefined") {
    const next = [entry, ...loadExports()].slice(0, 50);
    localStorage.setItem(KEY, JSON.stringify(next));
  }
  return entry;
}
