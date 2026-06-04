// Same-Origin-Proxy als Catch-All Route Handler.
//
// Leitet Anfragen von /api/app/* serverseitig an das FastAPI-Backend weiter.
// Nur die für das Backend relevanten Header werden weitergeleitet (Authorization,
// Content-Type). Alle Browser- und Vercel-spezifischen Headers (cookie, host,
// x-forwarded-*, …) werden bewusst NICHT weitergeleitet, um Interferenzen zu
// vermeiden. accept-encoding: identity verhindert komprimierte Antworten, die
// wir bytegenau durchreichen müssten.

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "https://erechnung.sbsdeutschland.com/api/app";

async function handler(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await ctx.params;
  const subpath = path.join("/");
  const { search } = new URL(req.url);
  const target = `${BACKEND_API_URL}/${subpath}${search}`;

  // Nur die Header weitergeben, die das Backend braucht.
  const outHeaders: Record<string, string> = {
    "accept-encoding": "identity", // unkomprimierte Antwort → kein Content-Encoding-Problem
    accept: "application/json",
  };

  const contentType = req.headers.get("content-type");
  if (contentType) outHeaders["content-type"] = contentType;

  const authorization = req.headers.get("authorization");
  if (authorization) outHeaders["authorization"] = authorization;

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const res = await fetch(target, {
    method: req.method,
    headers: outHeaders,
    body,
    cache: "no-store",
  });

  const resBody = await res.arrayBuffer();
  const resHeaders = new Headers();

  const ct = res.headers.get("content-type");
  if (ct) resHeaders.set("content-type", ct);

  return new Response(resBody, {
    status: res.status,
    headers: resHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

export const dynamic = "force-dynamic";
