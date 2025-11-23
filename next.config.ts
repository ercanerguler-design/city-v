import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['leaflet'],
  },
  // Force new build hash - invalidate CDN cache + Vercel build cache
  generateBuildId: async () => {
    // Unique ID: timestamp + random string + process ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const processId = process.pid || 0;
    return `build-${timestamp}-${random}-${processId}`;
  },
  // Disable caching for production debugging
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          // Mixed Content bypass için development
          {
            key: 'Content-Security-Policy',
            value: "img-src 'self' data: blob: http: https:; media-src 'self' data: blob: http: https:;"
          },
        ],
      },
    ]
  },
};

export default nextConfig;
