import { NextResponse } from "next/server";

// Nimmt Content-Security-Policy-Violation-Reports entgegen (report-uri).
// Antwortet immer mit 204. Es werden keine personenbezogenen Daten gespeichert —
// der Report wird ausschließlich serverseitig geloggt.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const report = body?.["csp-report"] ?? body;
    if (report) {
      console.warn("[CSP-Violation]", {
        documentUri: report["document-uri"],
        violatedDirective: report["violated-directive"],
        blockedUri: report["blocked-uri"],
      });
    }
  } catch {
    // Fehlerhafte Reports still verwerfen.
  }
  return new NextResponse(null, { status: 204 });
}
