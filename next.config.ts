import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Turbopack is the default engine for dev and build in Next 16.
  reactStrictMode: true,
  poweredByHeader: false,
  // Phaser is bundled into a client-only chunk; it must never be evaluated on the server.
  serverExternalPackages: ['phaser'],
  typedRoutes: true,
};

export default nextConfig;
