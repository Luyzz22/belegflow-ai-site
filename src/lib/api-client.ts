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
import { auditActionLabel } from "@/lib/audit";

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
  company?: string;
  is_admin?: boolean;
  unlimited?: boolean;
  plan?: string;
}

/** Entitlement/Paywall-Objekt aus /api/app/me bzw. /api/app/subscription. */
export interface Entitlement {
  plan?: string;
  is_admin?: boolean;
  unlimited?: boolean;
  allowed?: boolean;
  limit?: number | string; // Zahl oder "unlimited"
  used?: number;
  remaining?: number | string;
  reason?: string;
  message?: string;
}

export interface MeResponse {
  user: AppUser;
  entitlement: Entitlement | null;
}

/** /me kommt heute als { user, entitlement }; ältere Backends lieferten den
 *  User flach. Beide Formen tolerant auf MeResponse abbilden. */
export function normalizeMe(raw: unknown): MeResponse {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  if (o.user && typeof o.user === "object") {
    return {
      user: o.user as AppUser,
      entitlement: (o.entitlement && typeof o.entitlement === "object" ? (o.entitlement as Entitlement) : null),
    };
  }
  // Flaches Alt-Shape: raw IST der User (Entitlement evtl. eingebettet).
  return {
    user: o as unknown as AppUser,
    entitlement: (o.entitlement && typeof o.entitlement === "object" ? (o.entitlement as Entitlement) : null),
  };
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

/** Einzelner Prüfpunkt aus validierung_json.checks (defensiv typisiert —
 *  Feld-/Status-Namen variieren je Backend-Version). */
export interface ValidationCheck {
  feld?: string;
  field?: string;
  name?: string;
  rule?: string;
  label?: string;
  vorhanden?: boolean;
  ok?: boolean;
  passed?: boolean;
  valid?: boolean;
  status?: string; // "ok" | "pass" | "error" | "fail" | "warning" | …
  severity?: string; // "error" | "warning" | "info" (Backend)
  category?: string;
  message?: string;
  text?: string;
}

export interface Validierung {
  // Legacy/Demo-Felder (optional — echtes Backend liefert `checks` + `ok`).
  iban_valid?: boolean;
  ustid_valid?: boolean;
  pflichtangaben?: Array<{ feld: string; vorhanden: boolean } | string>;
  // Strukturierte Backend-Validierung (Quelle der Wahrheit).
  ok?: boolean;
  error_count?: number;
  checks?: ValidationCheck[];
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
  /** Autoritative Status-Verteilung vom Backend (Status → Anzahl). */
  status_breakdown?: Record<string, number>;
}

/** Eine offene Freigabe-ANFRAGE. Wichtig: `request_id` ist der Pfad-Parameter
 *  für /freigaben/{id}/approve — NICHT invoice_id. Live-Shape des Backends:
 *  { request_id, invoice_id, amount, current_stage, required_role, status,
 *    escalated, created_at, rechnungsnummer, rechnungsaussteller, age_hours,
 *    overdue }. Auf UI-freundliche Felder gemappt (betrag/lieferant/erstellt_am). */
export interface Freigabe {
  request_id: number;
  invoice_id: number;
  betrag: number;
  lieferant: string;
  rechnungsnummer?: string;
  stufe: string; // Anzeige-Rolle (required_role)
  current_stage?: number;
  required_role?: string;
  status: string; // "offen" | "freigegeben" | "abgelehnt" | …
  erstellt_am: string;
  age_hours?: number;
  overdue?: boolean;
  escalated?: boolean;
}

/** Antwort von /freigaben/{id}/approve|reject. `final` markiert die letzte Stufe;
 *  bei mehrstufiger Freigabe rückt `status:"offen"` an die nächste Rolle. */
export interface ApprovalResult {
  ok: boolean;
  status?: string; // "freigegeben" | "offen" | "abgelehnt"
  final?: boolean;
  next_role?: string;
}

export interface Lieferant {
  name: string;
  anzahl_rechnungen: number;
  gesamtvolumen: number;
  durchschnitt: number;
  letzte_rechnung: string;
  risiko_score: number;
  risiko_label?: string;
}

export interface LieferantDetail {
  name: string;
  rechnungen: InvoiceListItem[];
  statistik: Record<string, number | string>;
}

export interface AuditEntry {
  id: number;
  aktion: string; // Maschinencode (für Keyword-/Icon-Logik)
  aktion_label?: string; // lesbares deutsches Label (für Anzeige)
  benutzer: string;
  details: string;
  zeitpunkt: string;
  entity_type?: string;
  entity_id?: string;
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

export function normalizeKpis(raw: unknown): DashboardKpis {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  // trend: Backend liefert [{ date, count }] → auf [{ datum, anzahl }] abbilden.
  const rawTrend = Array.isArray(o.trend) ? o.trend : [];
  const trend = rawTrend.map((t) => {
    const e = (t && typeof t === "object" ? t : {}) as Record<string, unknown>;
    return { datum: _str(_pick(e, "datum", "date")), anzahl: _num(_pick(e, "anzahl", "count")) };
  });

  // status_breakdown: rohe Keys (pending/verarbeitet/…) unverändert übernehmen,
  // Werte zu Zahlen normalisieren.
  let status_breakdown: Record<string, number> | undefined;
  const sb = o.status_breakdown;
  if (sb && typeof sb === "object") {
    status_breakdown = {};
    for (const [k, v] of Object.entries(sb as Record<string, unknown>)) status_breakdown[k] = _num(v);
  }

  const oldest = _pick(o, "aelteste_freigabe_stunden", "oldest_age_hours");

  return {
    rechnungen_heute: _num(_pick(o, "rechnungen_heute", "count_today")),
    rechnungen_monat: _num(_pick(o, "rechnungen_monat", "count_month")),
    rechnungen_quartal: _num(_pick(o, "rechnungen_quartal", "count_quarter")),
    automatisierungsquote: _num(_pick(o, "automatisierungsquote", "automation_rate")),
    offene_freigaben: _num(_pick(o, "offene_freigaben", "open_approvals")),
    aelteste_freigabe_stunden: oldest == null ? null : _num(oldest),
    anomalie_alerts: _num(_pick(o, "anomalie_alerts", "anomaly_alerts")),
    trend,
    status_breakdown,
  };
}

/** Die erste Array-Eigenschaft aus einer Reihe möglicher Wrapper-Keys holen;
 *  fällt zurück auf das erste Array-Feld überhaupt bzw. auf raw, falls raw
 *  selbst ein Array ist. So sind wir robust gegen unbekannte Wrapper-Namen. */
function pickArray(raw: unknown, keys: string[]): unknown[] {
  if (Array.isArray(raw)) return raw;
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  for (const k of keys) {
    if (Array.isArray(o[k])) return o[k] as unknown[];
  }
  // Häufig: unter { data: … } oder { result: … } verschachtelt.
  for (const wrap of ["data", "result", "results", "payload"]) {
    const inner = o[wrap];
    if (Array.isArray(inner)) return inner as unknown[];
    if (inner && typeof inner === "object") {
      for (const k of keys) {
        const v = (inner as Record<string, unknown>)[k];
        if (Array.isArray(v)) return v as unknown[];
      }
    }
  }
  // Letzter Ausweg: das erste Array-Feld im Objekt.
  for (const v of Object.values(o)) if (Array.isArray(v)) return v as unknown[];
  return [];
}

/** Backend: { suppliers: [{ name, count, total, avg, last_date, risk_score, risk_label }] }.
 *  Auf die deutsche Lieferant-Form abbilden. Tolerant gegenüber Wrapper-Key und
 *  Feldnamen-Varianten (English/Deutsch), da die genaue Backend-Form variiert. */
export function normalizeSuppliers(raw: unknown): { items: Lieferant[] } {
  const arr = pickArray(raw, ["suppliers", "lieferanten", "items", "top", "top_suppliers", "vendors"]);
  const items = arr
    .map((it): Lieferant => {
      const r = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
      return {
        name: _str(_pick(r, "name", "lieferant", "supplier", "vendor", "rechnungsaussteller", "aussteller", "firma", "company")),
        anzahl_rechnungen: _num(_pick(r, "anzahl_rechnungen", "count", "anzahl", "invoice_count", "invoices", "rechnungen", "num_invoices")),
        gesamtvolumen: _num(_pick(r, "gesamtvolumen", "total", "sum", "summe", "volume", "volumen", "total_amount", "betrag_summe", "betrag")),
        durchschnitt: _num(_pick(r, "durchschnitt", "avg", "average", "mittel", "avg_amount")),
        letzte_rechnung: _str(_pick(r, "letzte_rechnung", "last_date", "last_invoice", "letztes_datum", "latest", "last")),
        risiko_score: _num(_pick(r, "risiko_score", "risk_score", "score")),
        risiko_label: _str(_pick(r, "risiko_label", "risk_label", "risiko", "risk")) || undefined,
      };
    })
    .filter((l) => l.name);
  return { items };
}

/** Fallback: Top-Lieferanten aus bereits geladenen Rechnungen aggregieren, wenn
 *  der /lieferanten-Endpoint (noch) nichts liefert. Nutzt ausschließlich echte
 *  Rechnungsdaten — es wird nichts erfunden. */
export function deriveSuppliersFromInvoices(items: InvoiceListItem[]): Lieferant[] {
  const map = new Map<string, { count: number; total: number; last: string }>();
  for (const inv of items) {
    const name = (inv?.lieferant || "").trim();
    if (!name || name === "—") continue;
    const e = map.get(name) ?? { count: 0, total: 0, last: "" };
    e.count += 1;
    e.total += _num(inv.betrag);
    const d = _str(inv.datum) || _str(inv.created_at);
    if (d > e.last) e.last = d;
    map.set(name, e);
  }
  return [...map.entries()].map(([name, e]) => ({
    name,
    anzahl_rechnungen: e.count,
    gesamtvolumen: e.total,
    durchschnitt: e.count ? e.total / e.count : 0,
    letzte_rechnung: e.last,
    risiko_score: 0,
  }));
}

function summarizeAuditDetails(d: unknown): string {
  if (typeof d === "string") return d;
  if (d && typeof d === "object") {
    const o = d as Record<string, unknown>;
    if (typeof o.message === "string") return o.message;
    return Object.entries(o)
      .slice(0, 3)
      .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
      .join(" · ");
  }
  return "";
}

/** Backend: { items: [{ id, action, entity_type, entity_id, details_json(String), created_at }] }.
 *  Auf AuditEntry abbilden; aktion bleibt der Rohcode, aktion_label ist das Anzeige-Label. */
export function normalizeAudit(raw: unknown): AuditList {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const arr = pickArray(raw, ["items", "logs", "entries", "eintraege", "audit", "events", "activities", "aktivitaeten"]);
  const items = arr.map((it, i): AuditEntry => {
    const r = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
    const action = _str(_pick(r, "aktion", "action", "event", "event_type", "typ", "type"));

    // details: bestehendes Feld oder details_json (JSON-STRING → parsen).
    let details = _str(_pick(r, "details", "beschreibung", "description", "message", "msg"));
    const dj = _pick(r, "details_json", "meta", "metadata", "payload", "data");
    if (!details && typeof dj === "string") {
      try {
        details = summarizeAuditDetails(JSON.parse(dj));
      } catch {
        details = dj; // kein JSON → als Klartext zeigen
      }
    } else if (!details && dj && typeof dj === "object") {
      details = summarizeAuditDetails(dj);
    }

    const benutzer =
      _str(_pick(r, "benutzer", "user", "username", "actor", "user_name")) ||
      (r.user_id != null ? `Benutzer #${_str(r.user_id)}` : "");

    return {
      id: _num(_pick(r, "id")) || i + 1,
      aktion: action,
      aktion_label: auditActionLabel(action),
      benutzer,
      details,
      zeitpunkt: _str(_pick(r, "zeitpunkt", "created_at", "timestamp", "time", "datum", "date")),
      entity_type: _str(_pick(r, "entity_type", "entity", "objekt")) || undefined,
      entity_id: _str(_pick(r, "entity_id", "object_id", "ref_id")) || undefined,
    };
  });
  return { items, total: _num(_pick(o, "total", "count")) || items.length };
}

/** Fallback: „Letzte Aktivität" aus geladenen Rechnungen ableiten, wenn der
 *  /audit-Endpoint (noch) nichts liefert. Jede Rechnung ist ein echtes
 *  Upload-Ereignis (created_at) — es wird nichts erfunden. */
export function deriveActivityFromInvoices(items: InvoiceListItem[]): AuditEntry[] {
  return items
    .map((inv, i): AuditEntry => {
      const zeitpunkt = _str(inv.created_at) || _str(inv.datum);
      const name = _str(inv.lieferant);
      return {
        id: _num(inv.id) || i + 1,
        aktion: "upload",
        aktion_label: auditActionLabel("upload"),
        benutzer: "System",
        details: name ? `${name}${inv.rechnungsnummer ? ` · ${inv.rechnungsnummer}` : ""}` : "",
        zeitpunkt,
      };
    })
    .filter((a) => a.zeitpunkt)
    .sort((a, b) => (a.zeitpunkt < b.zeitpunkt ? 1 : -1));
}

/** GET /freigaben → { items }. Live-Keys (request_id, amount, current_stage,
 *  required_role, created_at, rechnungsaussteller, age_hours, overdue) auf die
 *  kanonische Freigabe-Form abbilden. Nur Einträge mit request_id sind gültig. */
export function normalizeFreigaben(raw: unknown): { items: Freigabe[] } {
  const arr = pickArray(raw, ["items", "freigaben", "requests"]);
  const items = arr
    .map((it): Freigabe => {
      const r = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
      const role = _str(_pick(r, "required_role", "stufe", "rolle"));
      const ageRaw = _pick(r, "age_hours");
      return {
        request_id: _num(_pick(r, "request_id", "id")),
        invoice_id: _num(_pick(r, "invoice_id", "invoiceId")),
        betrag: _num(_pick(r, "amount", "betrag", "betrag_brutto", "brutto", "gesamtbetrag")),
        lieferant: _str(_pick(r, "rechnungsaussteller", "lieferant", "aussteller", "supplier")),
        rechnungsnummer: _str(_pick(r, "rechnungsnummer", "rechnungs_nr", "invoice_number")) || undefined,
        stufe: role,
        current_stage: _num(_pick(r, "current_stage", "stage")),
        required_role: role || undefined,
        status: _str(_pick(r, "status")) || "offen",
        erstellt_am: _str(_pick(r, "created_at", "erstellt_am")),
        age_hours: ageRaw == null ? undefined : _num(ageRaw),
        overdue: _pick(r, "overdue") === true,
        escalated: Boolean(_num(_pick(r, "escalated"))) || _pick(r, "escalated") === true,
      };
    })
    .filter((f) => f.request_id > 0);
  return { items };
}

/** POST-Aktion mit JSON-Body; gibt die geparste Antwort zurück. Bei Fehler wird
 *  die server-seitige `detail`-Meldung (als String, React #31-sicher) geworfen,
 *  damit die UI den echten Grund zeigen kann statt still zu reverten. */
async function postAction(path: string, body: Record<string, unknown>): Promise<ApprovalResult> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const data: Record<string, unknown> = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) handleUnauthorized();
    const detail = toMessage(data.detail ?? data.error ?? data);
    throw new ApiError(detail && detail !== "Unbekannter Fehler" ? detail : genericApiMessage(res.status), res.status);
  }
  return {
    ok: data.ok !== false,
    status: typeof data.status === "string" ? data.status : undefined,
    final: typeof data.final === "boolean" ? data.final : undefined,
    next_role: typeof data.next_role === "string" ? data.next_role : undefined,
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
  me: (): Promise<MeResponse> => api<unknown>("/me").then(normalizeMe),
  subscription: (): Promise<Entitlement> =>
    api<Entitlement>("/subscription").catch(() => ({} as Entitlement)),

  // Passwort-Reset anfordern
  requestPasswordReset: (email: string) =>
    api<{ ok?: boolean; detail?: string }>("/password-reset/request", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  // Dashboard
  kpis: (): Promise<DashboardKpis> =>
    isDemo() ? Promise.resolve(demo.demoKpis()) : api<unknown>("/dashboard/kpis").then(normalizeKpis),

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

  // Freigaben — die Liste treibt Review & Freigaben (nur Rechnungen MIT offener
  // Anfrage sind freigebbar). approve/reject IMMER mit request_id (nicht invoice_id).
  freigaben: (): Promise<{ items: Freigabe[] }> =>
    isDemo() ? Promise.resolve(demo.demoFreigaben()) : api<unknown>("/freigaben").then(normalizeFreigaben),
  approve: (requestId: number, comment?: string): Promise<ApprovalResult> =>
    isDemo()
      ? Promise.resolve({ ok: true, status: "freigegeben", final: true })
      : postAction(`/freigaben/${requestId}/approve`, comment ? { comment } : {}),
  reject: (requestId: number, grund?: string): Promise<ApprovalResult> =>
    isDemo()
      ? Promise.resolve({ ok: true, status: "abgelehnt", final: true })
      : postAction(`/freigaben/${requestId}/reject`, grund ? { grund } : {}),

  // Lieferanten
  lieferanten: (sort?: string): Promise<{ items: Lieferant[] }> =>
    isDemo()
      ? Promise.resolve({ items: demo.demoLieferanten() })
      : api<unknown>(`/lieferanten${sort ? `?sort=${encodeURIComponent(sort)}` : ""}`).then(normalizeSuppliers),
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
    return api<unknown>(`/audit${params ? `?${params}` : ""}`).then(normalizeAudit);
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
