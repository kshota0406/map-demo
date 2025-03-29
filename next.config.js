/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.pexels.com'],
    unoptimized: true,
  },
  experimental: {
    optimizeCss: true,
  },
  staticPageGenerationTimeout: 120,
};

module.exports = nextConfig; 