import { type NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import withPWA from "@ducanh2912/next-pwa";

const config: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: false, // Disabled to reduce bundle size - source maps add ~400KB
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header for security
  images: {
    formats: ['image/avif', 'image/webp'], // Optimize images
    minimumCacheTTL: 31536000, // Cache images for 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Optimize responsive images
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // Optimize icon sizes
  },
  experimental: {
    optimizeCss: true, // Optimize CSS
  },
  // Add caching headers for static assets
  async headers() {
    return [
      {
        // Cache images for 1 year
        source: '/:all*(svg|jpg|png|webp|avif|ico|gif)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        // Cache JS and CSS files for 1 year (they have content hashes)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        // Cache fonts for 1 year
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          }
        ]
      }
    ];
  },
};

const withPWAConfig = withPWA({
  dest: "public",
  disable: false, // Enable in dev for testing
  register: true,
  scope: "/",
  sw: "sw.js",
  // @ts-ignore - these options exist in the plugin but types might be outdated
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

export default withSentryConfig(
  withPWAConfig(config),
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: "khazaana",
    project: "khazaana-next-app",
    
    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    tunnelRoute: "/monitoring",
  }
);
