/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    // Enable server components by default (App Router)
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // Transpile workspace packages
  transpilePackages: ['@emma/shared-types', '@emma/ui', '@emma/config'],
  
  // Environment variables that should be exposed to the browser
  env: {
    CUSTOM_ENV_VAR: process.env.CUSTOM_ENV_VAR,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
