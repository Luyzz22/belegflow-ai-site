/** @type {import('next').NextConfig} */

// Der Same-Origin-Proxy für "/api/app/*" wird durch den Catch-All Route Handler
// in src/app/api/app/[...path]/route.ts realisiert (NICHT mehr durch einen
// Rewrite). Grund: Der Rewrite hat den Authorization-Header nicht zuverlässig
// an das Backend weitergeleitet → /api/app/me lieferte trotz gültigem Token
// einen 401. Das Proxy-Ziel wird serverseitig über die Umgebungsvariable
// BACKEND_API_URL gesteuert.

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // fonts.googleapis.com nötig, da Inter per <link>-Stylesheet geladen wird
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https:",
              "font-src 'self' data: https:",
              "connect-src 'self' https://erechnung.sbsdeutschland.com",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
              "report-uri /api/csp-report",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
