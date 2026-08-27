/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gstv.in',
    NEXT_PUBLIC_OG_IMAGE_BASE: process.env.NEXT_PUBLIC_OG_IMAGE_BASE || 'https://www.gstv.in',
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.gstv.in/backend2/api/v18/mobile',
  },

  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

  swcMinify: true,
  productionBrowserSourceMaps: false,

  images: {
    unoptimized: true,
    minimumCacheTTL: 60 * 60 * 24 * 30,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    remotePatterns: [
      { protocol: "https", hostname: "staging.gstv.in", pathname: "/**" },
      { protocol: "https", hostname: "www.gstv.in", pathname: "/**" },
      { protocol: "https", hostname: "react.gstv.in", pathname: "/**" },
    ],
  },

  async rewrites() {
    return [
      { source: '/sitemap-news-:page.xml', destination: '/sitemap-news/:page' },
    ];
  },

  async redirects() {
    return [
      { source: '/live-tv.html', destination: '/livetv', permanent: true },
      { source: '/live-tv', destination: '/livetv', permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/assets/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
    ];
  },

  webpack: (config, context) => {
    // Fix CSS minification issue by disabling cssnano-based CSS minifier
    if (context.isServer === false && config.optimization) {
      config.optimization.minimize = false;
    }
    
    if (!context.isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
