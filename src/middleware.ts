import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SECURE_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const sessionCookie = request.cookies.get("bf_session")?.value;

  if (isDashboardRoute && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    Object.entries(SECURE_HEADERS).forEach(([key, value]) => redirectResponse.headers.set(key, value));
    return redirectResponse;
  }

  const response = NextResponse.next();
  Object.entries(SECURE_HEADERS).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
