/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https', 
        hostname: 'images.ctfassets.net',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Production optimizations
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

  // Modern Next.js 15 experimental features
  experimental: {
    // Enable modern bundling features
    optimizePackageImports: ['react-icons', 'react-markdown'],
    // Tree shake unused code more aggressively  
    optimizeServerReact: true,
  },

  // Enable compression
  compress: true,

  // Service worker support
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/sw.js'
      }
    ];
  },

  // Performance headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=7200'
          }
        ]
      },
      {
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static',
        headers: [
          {
            key: 'Cache-Control', 
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },

  // Advanced bundle optimizations
  webpack: (config, { isServer, dev }) => {
    // Bundle analyzer for monitoring
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
      }));
    }

    if (!dev && !isServer) {
      // Optimize imports for better tree shaking
      config.resolve.alias = {
        ...config.resolve.alias,
        // Replace heavy libraries with lighter alternatives
        'react-icons/fa': 'react-icons/fa/index.esm.js',
        'react-icons/md': 'react-icons/md/index.esm.js', 
        'react-icons/hi': 'react-icons/hi/index.esm.js',
      };

      // Better chunk splitting
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
            test: /[\\/]node_modules[\\/](@firebase|firebase)[\\/]/,
            name: 'firebase',
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

      // Module concatenation for smaller bundles
      config.optimization.concatenateModules = true;
    }

    return config;
  },
};

export default nextConfig;
