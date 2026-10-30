import type { NextConfig } from 'next';

// The GitHub Pages build has no server runtime. Keep normal Next development
// and production builds unchanged unless static export is explicitly requested.
const staticExport = process.env.NEXT_STATIC_EXPORT === '1';

const nextConfig: NextConfig = {
  output: staticExport ? ('export' as const) : ('standalone' as const),
  ...(staticExport ? { basePath: '/monster-apartment', trailingSlash: true } : {}),
  // Turbopack is the default engine for dev and build in Next 16.
  reactStrictMode: true,
  // Pages serves files only: never emit /_next/image optimizer requests.
  // Dev/standalone can still use the ordinary image optimizer.
  images: {unoptimized: staticExport},
  poweredByHeader: false,
  // Playwright uses 127.0.0.1 while the Next dev server binds 0.0.0.0.
  // Next 16 blocks cross-origin dev chunks/HMR unless this host is trusted.
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  typedRoutes: true,
  env: {NEXT_PUBLIC_GAME_BASE_PATH:staticExport?'/monster-apartment':''},
};

export default nextConfig;
