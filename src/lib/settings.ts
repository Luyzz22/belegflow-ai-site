// Client-seitige Einstellungen (localStorage), bis Backend-Support kommt.

export type Kontenrahmen = "SKR03" | "SKR04";
export type Waehrung = "EUR" | "CHF" | "USD";
export type Datumsformat = "DD.MM.YYYY" | "YYYY-MM-DD";

export interface AppSettings {
  freigabe: {
    stufe1: number;
    stufe2: number;
    autoEnabled: boolean;
    autoUnder: number;
  };
  kontierung: {
    konto: string;
    gegenkonto: string;
    kontenrahmen: Kontenrahmen;
  };
  benachrichtigungen: {
    neueRechnungen: boolean;
    anomalien: boolean;
    taeglich: boolean;
  };
  darstellung: {
    waehrung: Waehrung;
    datumsformat: Datumsformat;
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  freigabe: { stufe1: 1000, stufe2: 10000, autoEnabled: false, autoUnder: 100 },
  kontierung: { konto: "4400", gegenkonto: "1200", kontenrahmen: "SKR03" },
  benachrichtigungen: { neueRechnungen: true, anomalien: true, taeglich: false },
  darstellung: { waehrung: "EUR", datumsformat: "DD.MM.YYYY" },
};

const KEY = "flowcheck_settings";

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      freigabe: { ...DEFAULT_SETTINGS.freigabe, ...parsed.freigabe },
      kontierung: { ...DEFAULT_SETTINGS.kontierung, ...parsed.kontierung },
      benachrichtigungen: { ...DEFAULT_SETTINGS.benachrichtigungen, ...parsed.benachrichtigungen },
      darstellung: { ...DEFAULT_SETTINGS.darstellung, ...parsed.darstellung },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: AppSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}
