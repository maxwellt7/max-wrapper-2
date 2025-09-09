const { withContentlayer } = require("next-contentlayer2");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  reactStrictMode: true,
  // Allow all hosts for Replit proxy environment
  experimental: {
    allowedHosts: true,
  },
  async rewrites() {
    return [
      {
        source: "/apps/:path*",
        destination: "/:path*",
      },
    ];
  },
};

module.exports = withContentlayer(nextConfig);
