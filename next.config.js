// next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['wordpress-74434-5742908.cloudwaysapps.com'],
    remotePatterns: [
      { protocol: 'https', hostname: 'wordpress-74434-5742908.cloudwaysapps.com', pathname: '/**' },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
  webpack(config) {
    config.resolve.alias = { '@': path.resolve(__dirname, 'src'), ...config.resolve.alias };
    return config;
  },
  // No rewrites/redirects/middleware with output:'export'
};
module.exports = nextConfig;
