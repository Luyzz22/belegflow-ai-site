/** @type {import('next').NextConfig} */

// Ziel-Backend für den Same-Origin-Proxy. Serverseitig (kein NEXT_PUBLIC_),
// damit der Browser nie direkt mit dem Backend spricht → kein CORS.
const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "https://erechnung.sbsdeutschland.com/api/app";

const nextConfig = {
  async rewrites() {
    return [
      // /api/app/* wird serverseitig an das FastAPI-Backend weitergeleitet.
      // Der Browser ruft ausschließlich die eigene Origin auf → keine CORS-Preflights.
      {
        source: "/api/app/:path*",
        destination: `${BACKEND_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
