// Same-Origin-Proxy für /api/app/* → FastAPI-Backend.
//
// Komplett neu aufgebaut. Leitet AUSSCHLIESSLICH Authorization + Content-Type
// an das Backend weiter. Debug-Logs zeigen in den Server-Logs (Vercel Functions),
// ob der Authorization-Header tatsächlich ankommt.

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

  // DEBUG: Kommt der Authorization-Header an?
  console.log(`[PROXY] ${req.method} ${target} auth=${auth ? "Bearer..." : "NONE"}`);

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.text();
  }

  const backendRes = await fetch(target, {
    method: req.method,
    headers,
    body,
    cache: "no-store",
  });

  const responseText = await backendRes.text();
  console.log(`[PROXY] Response: ${backendRes.status}`);

  return new Response(responseText, {
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
