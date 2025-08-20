// next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ Static export (creates /out on build)
  output: 'export',

  // ✅ Required on static hosts (no Next image optimizer runtime)
  images: {
    unoptimized: true,
    domains: ['wordpress-74434-5742908.cloudwaysapps.com'],
    remotePatterns: [
      { protocol: 'https', hostname: 'wordpress-74434-5742908.cloudwaysapps.com', pathname: '/**' }
    ],
  },

  webpack(config) {
    config.resolve.alias = { '@': path.resolve(__dirname, 'src'), ...config.resolve.alias };
    return config;
  },

  // ⚠️ Next's static export doesn't perform server redirects at runtime.
  // Keep these for local dev if you want, but we'll mirror them in .htaccess for production.
  async redirects() {
    return [
      { source: '/book', destination: '/services?book=1', permanent: false },
      { source: '/book/:slug*', destination: '/services/:slug*?book=1', permanent: false },
    ];
  },
};

module.exports = nextConfig;
