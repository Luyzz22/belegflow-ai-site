import { createHash, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { handoffLead, type LeadPayload } from "@/lib/leadHandoff";

export const runtime = "nodejs";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const ipWindow = new Map<string, number[]>();

const allowedReasons = new Set(["demo", "kontakt", "unterlagen", "api"]);

function prune(now: number, times: number[]) {
  return times.filter((timestamp) => now - timestamp < WINDOW_MS);
}

function validateLead(input: unknown): { ok: true; value: LeadPayload } | { ok: false; errors: string[] } {
  if (!input || typeof input !== "object") {
    return { ok: false, errors: ["Ungültiger Request-Body."] };
  }

  const body = input as Record<string, unknown>;
  const requiredStringFields: Array<keyof LeadPayload> = [
    "name",
    "company",
    "business_email",
    "role",
    "company_size",
    "monthly_invoice_volume",
    "interest",
    "message",
    "contact_reason",
  ];

  const errors: string[] = [];
  for (const field of requiredStringFields) {
    const value = body[field];
    if (typeof value !== "string" || value.trim().length < 2) {
      errors.push(`Feld '${field}' ist erforderlich.`);
    }
  }

  const email = typeof body.business_email === "string" ? body.business_email.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Bitte eine gültige geschäftliche E-Mail-Adresse angeben.");
  }

  const reason = typeof body.contact_reason === "string" ? body.contact_reason : "";
  if (!allowedReasons.has(reason)) {
    errors.push("Ungültiger Kontaktgrund.");
  }

  if (body.consent_contact !== true) {
    errors.push("Bitte der Kontaktaufnahme für die Anfragebearbeitung zustimmen.");
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      name: String(body.name).trim(),
      company: String(body.company).trim(),
      business_email: email,
      role: String(body.role).trim(),
      company_size: String(body.company_size).trim(),
      monthly_invoice_volume: String(body.monthly_invoice_volume).trim(),
      interest: String(body.interest).trim(),
      message: String(body.message).trim(),
      datev_context: Boolean(body.datev_context),
      erp_context: typeof body.erp_context === "string" ? body.erp_context.trim() : "",
      contact_reason: reason as LeadPayload["contact_reason"],
      consent_contact: true,
      website: typeof body.website === "string" ? body.website : "",
    },
  };
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recent = prune(now, ipWindow.get(ip) || []);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return NextResponse.json(
      { ok: false, error: "Zu viele Anfragen in kurzer Zeit. Bitte später erneut versuchen." },
      { status: 429 },
    );
  }

  recent.push(now);
  ipWindow.set(ip, recent);

  const json = await request.json().catch(() => null);
  const parsed = validateLead(json);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.errors.join(" ") }, { status: 400 });
  }

  if (parsed.value.website && parsed.value.website.trim().length > 0) {
    return NextResponse.json({ ok: true, lead_id: randomUUID(), status: "dropped_spam" });
  }

  const leadId = randomUUID();
  const sourcePath = request.headers.get("x-source-path") || undefined;
  const userAgent = request.headers.get("user-agent") || undefined;
  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);

  const handoff = await handoffLead(parsed.value, {
    lead_id: leadId,
    received_at: new Date().toISOString(),
    source_path: sourcePath,
    user_agent: userAgent,
    ip_hash: ipHash,
  });

  if (!handoff.delivered && handoff.mode === "webhook") {
    return NextResponse.json(
      { ok: false, error: "Anfrage validiert, aber Übergabe an Handoff-Endpunkt fehlgeschlagen. Bitte erneut versuchen oder per E-Mail kontaktieren." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    lead_id: leadId,
    status: handoff.mode === "noop" ? "accepted_noop" : "accepted",
    detail: handoff.detail,
  });
}
