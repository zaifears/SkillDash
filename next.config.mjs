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
  
  // ✅ NEW: Bundle optimization settings
  experimental: {
    // Enable modern bundling features
    optimizePackageImports: ['react-icons', 'react-markdown'],
    // Tree shake unused code more aggressively
    optimizeServerReact: true,
  },
  
  // ✅ NEW: Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    // Enable SWC minification for better performance
    swcMinify: true,
    
    // Remove console logs in production
    compiler: {
      removeConsole: {
        exclude: ['error'],
      },
    },
  }),
  
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
      // Service worker headers
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
  
  // ✅ ENHANCED: Bundle analyzer + advanced webpack optimizations
  webpack: (config, { isServer, dev }) => {
    // Bundle analyzer for monitoring
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
      }))
    }
    
    // ✅ NEW: Advanced bundle optimizations
    if (!dev && !isServer) {
      // Optimize imports for better tree shaking
      config.resolve.alias = {
        ...config.resolve.alias,
        // Replace heavy libraries with lighter alternatives
        'react-icons/fa': 'react-icons/fa/index.esm.js',
        'react-icons/md': 'react-icons/md/index.esm.js',
        'react-icons/hi': 'react-icons/hi/index.esm.js',
      };

      // ✅ NEW: Better chunk splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Vendor chunk for stable third-party libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          // Separate chunk for large libraries
          firebase: {
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            name: 'firebase',
            priority: 20,
            reuseExistingChunk: true,
          },
          // Separate chunk for AI libraries
          ai: {
            test: /[\\/]node_modules[\\/](@google|google-generative-ai|contentful)[\\/]/,
            name: 'ai-libs',
            priority: 20,
            reuseExistingChunk: true,
          },
          // Common components
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };

      // ✅ NEW: Module concatenation for smaller bundles
      config.optimization.concatenateModules = true;
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
