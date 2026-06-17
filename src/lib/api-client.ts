// src/lib/api-client.ts
// Zentraler API-Client für FlowCheck AI+
// Quelle der Wahrheit: FRONTEND_API.md
//
// Standardmäßig wird der Same-Origin-Pfad "/api/app" verwendet. Dieser wird in
// next.config.mjs serverseitig an https://erechnung.sbsdeutschland.com/api/app
// weitergeleitet (Rewrite-Proxy) — dadurch entfällt jegliches CORS im Browser.
// Für direkte Backend-Calls kann NEXT_PUBLIC_API_URL gesetzt werden (dann ist
// aber eine passende CORS-Konfiguration im Backend nötig).

import * as demo from "@/lib/demo-data";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/app";

export const TOKEN_KEY = "flowcheck_token";
export const USER_KEY = "flowcheck_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

// ── Demo-Modus (?demo=true) ──────────────────────────────────────────
export function isDemo(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("flowcheck_demo") === "1";
}
export function setDemoMode(on: boolean) {
  if (typeof window === "undefined") return;
  if (on) sessionStorage.setItem("flowcheck_demo", "1");
  else sessionStorage.removeItem("flowcheck_demo");
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

/** Generische, DSGVO-konforme Fehlermeldung je HTTP-Status.
 *  Es werden NIE Backend-Details (DB-Fehler, Stack-Traces, Feldnamen) durchgereicht. */
export function genericApiMessage(status: number): string {
  switch (status) {
    case 400:
      return "Die Anfrage konnte nicht verarbeitet werden.";
    case 401:
      return "Bitte melden Sie sich erneut an.";
    case 403:
      return "Sie haben keine Berechtigung für diese Aktion.";
    case 404:
      return "Die angeforderte Ressource wurde nicht gefunden.";
    case 429:
      return "Zu viele Anfragen. Bitte warten Sie einen Moment.";
    default:
      return status >= 500
        ? "Ein interner Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
        : "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.";
  }
}

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
    // Antwort-Body konsumieren, aber NICHT anzeigen — keine Daten-/Fehlerlecks.
    await res.text().catch(() => "");
    throw new ApiError(genericApiMessage(res.status), res.status);
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

export type InvoiceStatus = "neu" | "verarbeitet" | "freigegeben" | "exportiert" | "fehler";

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
  kpis: (): Promise<DashboardKpis> => (isDemo() ? Promise.resolve(demo.demoKpis()) : api<DashboardKpis>("/dashboard/kpis")),

  // Rechnungen
  invoices: (params?: string): Promise<InvoiceList> => {
    if (isDemo()) {
      let items = demo.demoInvoices();
      const status = new URLSearchParams(params || "").get("status");
      if (status) items = items.filter((i) => i.status === status);
      return Promise.resolve({ items, total: items.length });
    }
    return api<InvoiceList>(`/invoices${params ? `?${params}` : ""}`);
  },
  invoice: (id: number): Promise<InvoiceDetail> => {
    if (isDemo()) {
      const d = demo.demoInvoice(id);
      if (d) return Promise.resolve(d);
      return Promise.reject(new ApiError("Rechnung nicht gefunden", 404));
    }
    return api<InvoiceDetail>(`/invoices/${id}`);
  },

  // Upload (multipart) — Backend erwartet EIN Feld "file" pro Request.
  // Mehrere Dateien werden parallel als Einzel-Requests hochgeladen; Fehler
  // werden pro Datei zurückgegeben (kein Throw), damit die UI sie einzeln zeigt.
  upload: (files: File[]): Promise<UploadResult[]> =>
    isDemo()
      ? Promise.resolve(files.map((f) => ({ filename: f.name, status: "ok" as const })))
      : Promise.all(
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
  freigaben: (): Promise<{ items: Freigabe[] }> => (isDemo() ? Promise.resolve(demo.demoFreigaben()) : api<{ items: Freigabe[] }>("/freigaben")),
  approve: (id: number): Promise<{ ok: boolean }> =>
    isDemo() ? Promise.resolve({ ok: true }) : api<{ ok: boolean }>(`/freigaben/${id}/approve`, { method: "POST" }),
  reject: (id: number, grund: string): Promise<{ ok: boolean }> =>
    isDemo()
      ? Promise.resolve({ ok: true })
      : api<{ ok: boolean }>(`/freigaben/${id}/reject`, { method: "POST", body: JSON.stringify({ grund }) }),

  // Lieferanten
  lieferanten: (): Promise<{ items: Lieferant[] }> =>
    isDemo() ? Promise.resolve({ items: demo.demoLieferanten() }) : api<{ items: Lieferant[] }>("/lieferanten"),
  lieferant: (name: string): Promise<LieferantDetail> =>
    isDemo() ? Promise.resolve(demo.demoLieferantDetail(name)) : api<LieferantDetail>(`/lieferanten/${encodeURIComponent(name)}`),

  // DATEV-Export — Endpoints laut Design-Prompt
  datevPreview: (): Promise<{ items: DatevBuchung[]; total: number }> =>
    isDemo() ? Promise.resolve(demo.demoDatev()) : api<{ items: DatevBuchung[]; total: number }>("/datev/preview", { method: "POST" }),

  // Audit
  audit: (params?: string): Promise<AuditList> => {
    if (isDemo()) {
      const all = demo.demoAudit();
      const aktion = new URLSearchParams(params || "").get("aktion");
      const items = aktion ? all.items.filter((a) => a.aktion.toLowerCase().includes(aktion.toLowerCase())) : all.items;
      return Promise.resolve({ items, total: items.length });
    }
    return api<AuditList>(`/audit${params ? `?${params}` : ""}`);
  },
  auditCsvUrl: () => `${API_BASE}/audit/export.csv`,
};
