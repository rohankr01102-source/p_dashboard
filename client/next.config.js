/** @type {import('next').NextConfig} */

// Server-side env var (not exposed to the browser).
// In Docker Compose, set BACKEND_URL=http://server:5000
// In local dev, defaults to http://127.0.0.1:5000
const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:5000";

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${BACKEND_URL}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
