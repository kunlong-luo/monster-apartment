import type { NextConfig } from 'next';

// The GitHub Pages build has no server runtime. Keep normal Next development
// and production builds unchanged unless static export is explicitly requested.
const staticExport = process.env.NEXT_STATIC_EXPORT === '1';

const nextConfig: NextConfig = {
  output: staticExport ? ('export' as const) : ('standalone' as const),
  ...(staticExport ? { basePath: '/monster-apartment', trailingSlash: true } : {}),
  // Turbopack is the default engine for dev and build in Next 16.
  reactStrictMode: true,
  poweredByHeader: false,
  // Phaser is bundled into a client-only chunk; it must never be evaluated on the server.
  serverExternalPackages: ['phaser'],
  typedRoutes: true,
};

export default nextConfig;
