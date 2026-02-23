import type { NextConfig } from "next";

const ML_API_URL = process.env.ML_API_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.nba.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${ML_API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
