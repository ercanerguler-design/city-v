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
  // Force new build hash - invalidate CDN cache
  generateBuildId: async () => {
    return `build-${Date.now()}`
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
