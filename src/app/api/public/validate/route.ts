// Öffentlicher, AUTH-FREIER Same-Origin-Proxy für die login-freie E-Rechnungs-Prüfung.
// Leitet multipart/form-data (Feld "file") an den öffentlichen Backend-Endpoint weiter.
// Bewusst getrennt vom authentifizierten Proxy app/api/app/[...path] — KEIN Authorization-Header.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Backend-Basis aus der bestehenden ENV ableiten (…/api/app → Wurzel) und den
// öffentlichen Validierungspfad anhängen. Per ENV überschreibbar.
const BASE = (process.env.BACKEND_API_URL || "https://erechnung.sbsdeutschland.com/api/app").replace(
  /\/api\/app\/?$/,
  ""
);
const TARGET = process.env.BACKEND_PUBLIC_VALIDATE_URL || `${BASE}/api/public/validate`;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request): Promise<Response> {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return Response.json({ error: "Ungültiges Anfrageformat." }, { status: 400 });
  }

  // Soft-Limit anhand Content-Length (hartes Limit liegt im Backend).
  const declared = Number(req.headers.get("content-length") || "0");
  if (declared && declared > MAX_BYTES + 1024 * 512) {
    return Response.json({ error: "Datei zu groß. Maximum: 10 MB." }, { status: 413 });
  }

  let body: ArrayBuffer;
  try {
    body = await req.arrayBuffer();
  } catch {
    return Response.json({ error: "Anfrage konnte nicht gelesen werden." }, { status: 400 });
  }
  if (body.byteLength > MAX_BYTES + 1024 * 512) {
    return Response.json({ error: "Datei zu groß. Maximum: 10 MB." }, { status: 413 });
  }

  try {
    const backendRes = await fetch(TARGET, {
      method: "POST",
      // Multipart-Boundary aus dem Original-Content-Type erhalten; KEIN Auth-Header.
      headers: { "Content-Type": contentType },
      body,
      cache: "no-store",
    });

    const buf = await backendRes.arrayBuffer();
    const headers: Record<string, string> = {
      "Content-Type": backendRes.headers.get("content-type") || "application/json",
    };
    const retryAfter = backendRes.headers.get("retry-after");
    if (retryAfter) headers["Retry-After"] = retryAfter;

    return new Response(buf, { status: backendRes.status, headers });
  } catch {
    return Response.json({ error: "Validierungsdienst nicht erreichbar." }, { status: 502 });
  }
}
