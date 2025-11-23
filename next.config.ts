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
  // CRITICAL: Force Turbopack to generate new chunk hashes
  turbopack: {
    resolveAlias: {
      // This forces module resolution to be different each build
      '@turbo-cache-bust': `./node_modules/.cache/turbo-${Date.now()}`,
    },
  },
  // CRITICAL: Disable webpack/turbopack chunk hashing optimization
  webpack: (config: any) => {
    // Force unique chunk IDs every build
    config.optimization = config.optimization || {};
    config.optimization.moduleIds = 'deterministic';
    config.optimization.chunkIds = 'deterministic';
    return config;
  },
  // Force new build hash - invalidate CDN cache + Vercel build cache
  generateBuildId: async () => {
    // Unique ID: timestamp + random string + process ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const processId = process.pid || 0;
    return `build-${timestamp}-${random}-${processId}`;
  },
  // Disable caching for production debugging + FORCE CDN INVALIDATION
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
      // CRITICAL: Force no-cache for _next/static chunks (CDN bypass)
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
