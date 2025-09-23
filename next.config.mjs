/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Enable modern image formats for better compression
    formats: ['image/avif', 'image/webp'],
    
    // Your existing + new remote patterns
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net', // Contentful CDN
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google profile images
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // GitHub profile images
      }
    ],
    
    // Optimize for different screen sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Cache images for 1 year
    minimumCacheTTL: 31536000,
    
    // Enable image optimization for better performance
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Enable compression
  compress: true,
  
  // REMOVED: optimizeCss (causes critters dependency issue)
  // Enable Turbopack for faster builds (Next.js 15)
  turbo: {
    resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },
  
  // ✅ NEW: Enable service worker support
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/sw.js',
      },
    ];
  },
  
  // ✅ UPDATED: Add performance headers + service worker headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=7200' },
        ],
      },
      {
        source: '/_next/image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // ✅ NEW: Service worker headers
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ]
  },
  
  // Bundle analyzer for monitoring (run with ANALYZE=true npm run build)
  webpack: (config, { isServer }) => {
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
      }))
    }
    
    // Optimize bundle splitting
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    
    return config
  },
}

export default nextConfig
