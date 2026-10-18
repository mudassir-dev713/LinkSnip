/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // geoip-lite loads its .dat databases from disk at runtime — bundling it
  // breaks the file paths, so require it natively instead.
  serverExternalPackages: ['geoip-lite'],
  // Enable compression
  compress: true,
  // Optimize react production build
  reactStrictMode: true,
  // Enable browser source map in development
  productionBrowserSourceMaps: process.env.NODE_ENV === 'development',
  // Optimize static assets
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      '@radix-ui/react-*',
      '@heroicons/react/*',
    ],
  },
};

module.exports = withPWA(nextConfig);