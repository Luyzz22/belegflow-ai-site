/** @type {import('next').NextConfig} */

// Der Same-Origin-Proxy für "/api/app/*" wird durch den Catch-All Route Handler
// in src/app/api/app/[...path]/route.ts realisiert (NICHT mehr durch einen
// Rewrite). Grund: Der Rewrite hat den Authorization-Header nicht zuverlässig
// an das Backend weitergeleitet → /api/app/me lieferte trotz gültigem Token
// einen 401. Das Proxy-Ziel wird serverseitig über die Umgebungsvariable
// BACKEND_API_URL gesteuert.

const nextConfig = {};

export default nextConfig;
