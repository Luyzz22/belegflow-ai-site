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

/** Fehler mit HTTP-Status, damit UIs gezielt auf 401/403/404 reagieren können. */export class ApiError extends Error {
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

/** FastAPI/Pydantic-Fehler sicher in einen String wandeln (React #31-Schutz).
 *  422 liefert { detail: [{ type, loc, msg, input }, …] } — NIE das Objekt/Array
 *  direkt als React-Child rendern, IMMER durch toMessage(). */
export function toMessage(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const parts = detail
      .map((d) => {
        if (typeof d === "string") return d;
        if (d && typeof d === "object" && typeof (d as { msg?: unknown }).msg === "string") {
          return (d as { msg: string }).msg;
        }
        return null;
      })
      .filter((x): x is string => x !== null);
    if (parts.length > 0) return parts.join("; ");
    return "Unbekannter Fehler";
  }
  if (detail && typeof detail === "object") {
    const o = detail as { msg?: unknown; message?: unknown; detail?: unknown; error?: unknown };
    if (typeof o.msg === "string") return o.msg;
    if (typeof o.message === "string") return o.message;
    if (o.detail !== undefined && o.detail !== detail) return toMessage(o.detail);
    if (typeof o.error === "string") return o.error;
  }
  return "Unbekannter Fehler";
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

/** Einzel-Datei-Upload (multipart/form-data) — Feldname "files" (Backend erwartet
 *  List[UploadFile]). KEIN Content-Type manuell setzen: der Browser setzt
 *  multipart/form-data inkl. Boundary selbst. */
async function uploadFile(path: string, file: File): Promise<Response> {
  const token = getToken();
  const fd = new FormData();
  fd.append("files", file);
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

export type WebhookEvent = "invoice.processed" | "invoice.approved" | "invoice.rejected" | "export.completed";

export interface Webhook {
  id: string | number;
  url: string;
  events: WebhookEvent[];
  active?: boolean;
  created_at?: string;
}

export interface WebhookInput {
  url: string;
  secret?: string;
  events: WebhookEvent[];
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

// ── Feldnamen-Normalisierung ─────────────────────────────────────────
// Das Backend/DB liefert Beträge & Kennungen teils unter abweichenden
// Spaltennamen (z. B. betrag_brutto, mwst_betrag, ust_idnr,
// rechnungsaussteller). Hier auf die kanonischen Frontend-Feldnamen
// abbilden, damit die UI vorhandene Werte nicht unterschlägt.
function _num(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}
function _str(v: unknown): string {
  if (typeof v === "string") return v;
  if (v == null) return "";
  return String(v);
}
function _pick(o: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    const val = o[k];
    if (val !== undefined && val !== null && val !== "") return val;
  }
  return undefined;
}

function normalizeInvoiceDetail(raw: unknown): InvoiceDetail {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    ...(o as Partial<InvoiceDetail> as InvoiceDetail),
    lieferant: _str(_pick(o, "lieferant", "rechnungsaussteller", "aussteller", "supplier")),
    rechnungsnummer: _str(_pick(o, "rechnungsnummer", "rechnungs_nr", "invoice_number")),
    datum: _str(_pick(o, "datum", "rechnungsdatum", "invoice_date")),
    betrag: _num(_pick(o, "betrag", "betrag_brutto", "brutto", "gesamtbetrag", "total")),
    netto: _num(_pick(o, "netto", "betrag_netto", "netto_betrag")),
    ust_betrag: _num(_pick(o, "ust_betrag", "mwst_betrag", "steuer_betrag", "vat_amount")),
    ust_satz: _num(_pick(o, "ust_satz", "mwst_satz", "steuersatz", "vat_rate")),
    iban: _str(_pick(o, "iban")),
    ust_id: _str(_pick(o, "ust_id", "ust_idnr", "ustid", "umsatzsteuer_id", "vat_id")),
    waehrung: _str(_pick(o, "waehrung", "currency")) || "EUR",
  };
}

function normalizeInvoiceList(raw: unknown): InvoiceList {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const items = Array.isArray(o.items) ? o.items : [];
  return {
    total: _num(o.total) || items.length,
    items: items.map((it): InvoiceListItem => {
      const r = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
      return {
        ...(r as Partial<InvoiceListItem> as InvoiceListItem),
        lieferant: _str(_pick(r, "lieferant", "rechnungsaussteller", "aussteller")),
        rechnungsnummer: _str(_pick(r, "rechnungsnummer", "rechnungs_nr", "invoice_number")),
        datum: _str(_pick(r, "datum", "rechnungsdatum", "invoice_date")),
        betrag: _num(_pick(r, "betrag", "betrag_brutto", "brutto", "gesamtbetrag")),
        waehrung: _str(_pick(r, "waehrung", "currency")) || "EUR",
      };
    }),
  };
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
    return api<unknown>(`/invoices${params ? `?${params}` : ""}`).then(normalizeInvoiceList);
  },
  invoice: (id: number): Promise<InvoiceDetail> => {
    if (isDemo()) {
      const d = demo.demoInvoice(id);
      if (d) return Promise.resolve(d);
      return Promise.reject(new ApiError("Rechnung nicht gefunden", 404));
    }
    return api<unknown>(`/invoices/${id}`).then(normalizeInvoiceDetail);
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
            // 422 liefert detail als Array von Objekten — via toMessage() zu String
            // normalisieren, sonst crasht das Rendern (React #31).
            const err: { detail?: unknown; error?: unknown } = await res
              .json()
              .catch(() => ({}));
            const raw = err.detail ?? err.error;
            return {
              filename: file.name,
              status: "error",
              detail: raw !== undefined && raw !== null ? toMessage(raw) : genericApiMessage(res.status),
            };
          }
          const data: { id?: number; detail?: unknown } = await res.json().catch(() => ({}));
          return {
            filename: file.name,
            status: "ok",
            id: data.id,
            detail: typeof data.detail === "string" ? data.detail : undefined,
          };
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
  lieferant: (name: string): Promise<LieferantDetail> => {
    // Defensiv: ungültiger Name → gar keinen Request feuern (verhindert
    // /lieferanten/undefined und einen unnötigen 404/422).
    const clean = (name || "").trim();
    if (!clean || clean === "undefined" || clean === "null") {
      return Promise.reject(new ApiError("Kein gültiger Lieferant", 400));
    }
    return isDemo()
      ? Promise.resolve(demo.demoLieferantDetail(clean))
      : api<LieferantDetail>(`/lieferanten/${encodeURIComponent(clean)}`);
  },

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

  // Webhooks (n8n-Integration)
  webhooks: (): Promise<{ items: Webhook[] }> =>
    isDemo() ? Promise.resolve({ items: [] }) : api<{ items: Webhook[] }>("/webhooks"),
  createWebhook: (payload: WebhookInput): Promise<Webhook> =>
    api<Webhook>("/webhooks", { method: "POST", body: JSON.stringify(payload) }),
  deleteWebhook: (id: string | number): Promise<{ ok: boolean }> =>
    api<{ ok: boolean }>(`/webhooks/${id}`, { method: "DELETE" }),
  testWebhook: (url: string): Promise<{ ok: boolean }> =>
    api<{ ok: boolean }>("/webhooks/test", { method: "POST", body: JSON.stringify({ url }) }),
};
