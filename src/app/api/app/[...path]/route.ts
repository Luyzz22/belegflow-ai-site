// Same-Origin-Proxy für /api/app/* → FastAPI-Backend.
//
// Leitet AUSSCHLIESSLICH Authorization + Content-Type an das Backend weiter.
// Der Browser spricht ausschließlich die eigene Origin an → kein CORS.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BACKEND =
  process.env.BACKEND_API_URL || "https://erechnung.sbsdeutschland.com/api/app";

async function proxyHandler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  // /api/app/login → /login (BACKEND enthält bereits den /api/app-Teil)
  const backendPath = url.pathname.replace(/^\/api\/app/, "");
  const target = `${BACKEND}${backendPath}${url.search}`;

  // NUR diese beiden Header weiterleiten.
  const headers: Record<string, string> = {};

  const auth = req.headers.get("authorization");
  if (auth) headers["Authorization"] = auth;

  const ct = req.headers.get("content-type");
  if (ct) headers["Content-Type"] = ct;

  // Roh-Body als Bytes weiterleiten (NICHT als Text parsen) — sonst werden
  // multipart/binary-Uploads (PDF, Bilder) zerstört. arrayBuffer() erhält die
  // exakten Bytes inkl. multipart-Boundary.
  const body =
    req.method !== "GET" && req.method !== "HEAD" ? await req.arrayBuffer() : undefined;

  const backendRes = await fetch(target, {
    method: req.method,
    headers,
    body,
    cache: "no-store",
  });

  // Antwort ebenfalls als Bytes durchreichen (funktioniert für JSON wie für
  // Datei-Downloads, z. B. DATEV-CSV).
  const responseBody = await backendRes.arrayBuffer();

  return new Response(responseBody, {
    status: backendRes.status,
    headers: {
      "Content-Type": backendRes.headers.get("content-type") || "application/json",
    },
  });
}

export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const DELETE = proxyHandler;
export const PATCH = proxyHandler;
