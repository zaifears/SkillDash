/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    // Keep TypeScript checking enabled
    ignoreBuildErrors: false,
  },
  experimental: {
    optimizePackageImports: ['react-icons'],
  },
  
  // Turbopack configuration for Next.js 16
  turbopack: {
    resolveAlias: {
      '@': './src',
    },
  },
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
      },
    ],
  },
  
  // Enable compression and optimize bundles
  compress: true,
  poweredByHeader: false,
  
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Webpack configuration to handle Windows path issues with colons
  webpack: (config, { isServer }) => {
    if (isServer && process.platform === 'win32') {
      config.output.chunkFilename = '[id].js';
      config.output.filename = '[name].js';
    }
    return config;
  },
  
  // Fixed HTTP headers with correct regex
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // 🚀 Cache static HTML pages (24 hours)
      {
        source: '/about-us',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
      {
        source: '/policy',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, s-maxage=604800',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // 🚀 Cache API responses
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, max-age=300',
          },
        ],
      },
    ];
  },

  // Rewrites for manifest file compatibility
  async rewrites() {
    return [
      {
        source: '/manifest.webmanifest',
        destination: '/site.webmanifest',
      },
    ];
  },

  // Domain-based redirects for multi-domain support
  async redirects() {
    const hrDomain = process.env.NEXT_PUBLIC_HR_DOMAIN || 'https://hr.skilldash.live';
    return [
      // Redirect /opportunities/hiring to /hr (same domain)
      {
        source: '/opportunities/hiring/:path*',
        destination: '/hr/:path*',
        permanent: true,
      },
      // Redirect /opportunities/hiring to /hr on main domain (for backward compatibility)
      {
        source: '/opportunities/hiring/:path*',
        destination: `${hrDomain}/:path*`,
        permanent: false,
        has: [
          {
            type: 'host',
            value: 'skilldash.live',
          },
        ],
      },
      {
        source: '/opportunities/hiring/:path*',
        destination: `${hrDomain}/:path*`,
        permanent: false,
        has: [
          {
            type: 'host',
            value: 'www.skilldash.live',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
