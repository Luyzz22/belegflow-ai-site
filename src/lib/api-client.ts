// src/lib/api-client.ts
// Zentraler API-Client für FlowCheck AI+
// Quelle der Wahrheit: FRONTEND_API.md
//
// Standardmäßig wird der Same-Origin-Pfad "/api/app" verwendet. Dieser wird in
// next.config.mjs serverseitig an https://erechnung.sbsdeutschland.com/api/app
// weitergeleitet (Rewrite-Proxy) — dadurch entfällt jegliches CORS im Browser.
// Für direkte Backend-Calls kann NEXT_PUBLIC_API_URL gesetzt werden (dann ist
// aber eine passende CORS-Konfiguration im Backend nötig).

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/app";

export const TOKEN_KEY = "flowcheck_token";
export const USER_KEY = "flowcheck_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(token: string, user?: AppUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** Fehler mit HTTP-Status, damit UIs gezielt auf 401/403/404 reagieren können. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

/** 401 → Session verwerfen und (außerhalb der Auth-Seiten) zum Login schicken. */
function handleUnauthorized() {
  if (typeof window === "undefined") return;
  clearSession();
  if (!AUTH_PATHS.includes(window.location.pathname)) {
    window.location.href = "/login";
  }
}

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    if (res.status === 401) handleUnauthorized();
    const err = await res.json().catch(() => ({ detail: "Unbekannter Fehler" }));
    throw new ApiError(err.detail || `HTTP ${res.status}`, res.status);
  }

  // 204 / leere Antworten tolerieren
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Einzel-Datei-Upload (multipart/form-data) — Feldname "file", KEIN JSON-Content-Type
 *  (der Browser setzt multipart/form-data inkl. Boundary automatisch). */
async function uploadFile(path: string, file: File): Promise<Response> {
  const token = getToken();
  const fd = new FormData();
  fd.append("file", file);
  return fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: fd,
  });
}

// ───────────────────────────── Typen ─────────────────────────────

// Das Backend liefert aktuell ausschließlich "admin" oder "user".
export type Role = "admin" | "user" | string;

export interface AppUser {
  id: number | string;
  email: string;
  // /me liefert KEINEN Namen (nur /login). Daher optional.
  name?: string;
  role: Role;
  tenant_id?: string;
}

export interface AuthResponse {
  token: string;
  user: AppUser;
}

export type InvoiceStatus = "neu" | "verarbeitet" | "freigegeben" | "exportiert";

export interface InvoiceListItem {
  id: number;
  lieferant: string;
  rechnungsnummer: string;
  datum: string;
  betrag: number;
  waehrung: string;
  status: InvoiceStatus;
  created_at: string;
}

export interface InvoiceList {
  items: InvoiceListItem[];
  total: number;
}

export interface Kontierung {
  konto: string;
  gegenkonto: string;
  steuerschluessel: string;
}

export interface Validierung {
  iban_valid: boolean;
  ustid_valid: boolean;
  pflichtangaben: Array<{ feld: string; vorhanden: boolean } | string>;
}

export interface InvoiceDetail {
  id: number;
  lieferant: string;
  rechnungsnummer: string;
  datum: string;
  betrag: number;
  netto: number;
  ust_betrag: number;
  ust_satz: number;
  waehrung: string;
  iban: string;
  ust_id: string;
  status: InvoiceStatus | string;
  kontierung: Kontierung;
  validierung: Validierung;
  anomalien: Array<{ typ?: string; beschreibung?: string; schwere?: string } | string>;
  zahlungsbedingungen?: string;
  faelligkeit?: string;
  approved_at?: string;
  rejected_at?: string;
  exported_at?: string;
  paid_at?: string;
  created_at: string;
}

export interface DashboardKpis {
  rechnungen_heute: number;
  rechnungen_monat: number;
  rechnungen_quartal: number;
  automatisierungsquote: number; // 0–100
  offene_freigaben: number;
  aelteste_freigabe_stunden: number | null;
  anomalie_alerts: number;
  trend: Array<{ datum: string; anzahl: number }>;
}

export interface Freigabe {
  id: number;
  invoice_id: number;
  betrag: number;
  lieferant: string;
  rechnungsnummer?: string;
  stufe: string;
  status: string;
  erstellt_am: string;
}

export interface Lieferant {
  name: string;
  anzahl_rechnungen: number;
  gesamtvolumen: number;
  durchschnitt: number;
  letzte_rechnung: string;
  risiko_score: number;
}

export interface LieferantDetail {
  name: string;
  rechnungen: InvoiceListItem[];
  statistik: Record<string, number | string>;
}

export interface AuditEntry {
  id: number;
  aktion: string;
  benutzer: string;
  details: string;
  zeitpunkt: string;
}

export interface AuditList {
  items: AuditEntry[];
  total: number;
}

export interface UploadResult {
  id?: number;
  filename: string;
  status: "ok" | "error" | string;
  detail?: string;
}

/** Ein DATEV-Buchungssatz aus /datev/preview. Felder je nach Backend optional;
 *  zusätzliche Spalten werden generisch unterstützt. */
export interface DatevBuchung {
  lieferant?: string;
  rechnungsnummer?: string;
  betrag?: number | string;
  konto?: string | number;
  gegenkonto?: string | number;
  steuerschluessel?: string | number;
  [key: string]: string | number | undefined;
}

// ─────────────────────────── API-Methoden ───────────────────────────

export const flowcheckApi = {
  // Auth
  login: (email: string, password: string) =>
    api<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, name: string) =>
    api<AuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),
  me: () => api<AppUser>("/me"),

  // Passwort-Reset anfordern
  requestPasswordReset: (email: string) =>
    api<{ ok?: boolean; detail?: string }>("/password-reset/request", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  // Dashboard
  kpis: () => api<DashboardKpis>("/dashboard/kpis"),

  // Rechnungen
  invoices: (params?: string) => api<InvoiceList>(`/invoices${params ? `?${params}` : ""}`),
  invoice: (id: number) => api<InvoiceDetail>(`/invoices/${id}`),

  // Upload (multipart) — Backend erwartet EIN Feld "file" pro Request.
  // Mehrere Dateien werden parallel als Einzel-Requests hochgeladen; Fehler
  // werden pro Datei zurückgegeben (kein Throw), damit die UI sie einzeln zeigt.
  upload: (files: File[]): Promise<UploadResult[]> =>
    Promise.all(
      files.map(async (file): Promise<UploadResult> => {
        try {
          const res = await uploadFile("/upload", file);
          if (!res.ok) {
            if (res.status === 401) handleUnauthorized();
            const err: { detail?: string; error?: string } = await res
              .json()
              .catch(() => ({}));
            return {
              filename: file.name,
              status: "error",
              detail: err.detail || err.error || `HTTP ${res.status}`,
            };
          }
          const data: { id?: number; detail?: string } = await res.json().catch(() => ({}));
          return { filename: file.name, status: "ok", id: data.id, detail: data.detail };
        } catch {
          return { filename: file.name, status: "error", detail: "Netzwerkfehler beim Upload" };
        }
      })
    ),

  // Freigaben
  freigaben: () => api<{ items: Freigabe[] }>("/freigaben"),
  approve: (id: number) => api<{ ok: boolean }>(`/freigaben/${id}/approve`, { method: "POST" }),
  reject: (id: number, grund: string) =>
    api<{ ok: boolean }>(`/freigaben/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ grund }),
    }),

  // Lieferanten
  lieferanten: () => api<{ items: Lieferant[] }>("/lieferanten"),
  lieferant: (name: string) => api<LieferantDetail>(`/lieferanten/${encodeURIComponent(name)}`),

  // DATEV-Export — Endpoints laut Design-Prompt
  datevPreview: () =>
    api<{ items: DatevBuchung[]; total: number }>("/datev/preview", { method: "POST" }),

  // Audit
  audit: (params?: string) => api<AuditList>(`/audit${params ? `?${params}` : ""}`),
  auditCsvUrl: () => `${API_BASE}/audit/export.csv`,
};
