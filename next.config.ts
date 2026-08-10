import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV !== "production";
const twoFactorCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `connect-src 'self'${isDevelopment ? " ws:" : ""}`,
  "img-src 'self' data: blob:",
  "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
].join("; ");

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: "/2fa/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, private" },
          { key: "Content-Security-Policy", value: twoFactorCsp },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
