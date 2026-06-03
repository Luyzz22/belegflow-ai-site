// Same-Origin-Proxy als Catch-All Route Handler.
//
// Ersetzt den früheren next.config.mjs-Rewrite. Grund: Der Rewrite hat den
// Authorization-Header NICHT zuverlässig an das Backend weitergeleitet →
// /api/app/me lieferte trotz gültigem Token einen 401. Dieser Handler leitet
// ALLE eingehenden Header (inkl. Authorization) sowie den Request-Body
// unverändert an das FastAPI-Backend weiter. Der Browser spricht ausschließlich
// die eigene Origin an → kein CORS.

// Hinweis: BACKEND_API_URL enthält wie bisher den "/api/app"-Suffix.
const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "https://erechnung.sbsdeutschland.com/api/app";

// Hop-by-hop / vom Proxy selbst zu setzende Header nicht durchreichen.
const STRIP_REQUEST_HEADERS = ["host", "connection", "content-length"];

async function handler(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await ctx.params;
  const subpath = Array.isArray(path) ? path.join("/") : "";
  const search = new URL(req.url).search;
  const target = `${BACKEND_API_URL}/${subpath}${search}`;

  // Eingehende Header 1:1 übernehmen (Authorization, Content-Type-Boundary …).
  const headers = new Headers(req.headers);
  for (const h of STRIP_REQUEST_HEADERS) headers.delete(h);

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const res = await fetch(target, {
    method: req.method,
    headers,
    body,
    redirect: "manual",
  });

  // Antwort durchreichen. Content-Type erhalten, damit JSON korrekt geparst wird.
  const resBody = await res.arrayBuffer();
  const responseHeaders = new Headers();
  const ct = res.headers.get("content-type");
  if (ct) responseHeaders.set("content-type", ct);

  return new Response(resBody, {
    status: res.status,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

// Dynamisch erzwingen — niemals zur Build-Zeit cachen.
export const dynamic = "force-dynamic";
