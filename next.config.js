/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    }
  ]
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Optimizări pentru performanță și lazy loading
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-toastify', 'date-fns']
  },
  
  // Configurare webpack pentru code splitting optimizat
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      };
    }
    return config;
  },
  
  // Configurare pentru deployment pe VPS - folosim modul standard
  // output: 'standalone', // Comentat - folosim modul standard pentru a evita problemele cu fișierele statice
  
  // Configurare pentru API backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? process.env.STAGING === 'true'
            ? 'http://localhost:4000/api/:path*'  // Staging backend port 4000
            : 'http://localhost:3000/api/:path*'  // Production backend port 3000
          : 'http://localhost:8001/api/:path*'   // Local development port 8001
      }
    ]
  },

  // Headers pentru securitate
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ]
  },

  // Configurare pentru imagini
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif']
  },

  // Configurare pentru limba română
  i18n: {
    locales: ['ro'],
    defaultLocale: 'ro'
  }
}

module.exports = withPWA(nextConfig)