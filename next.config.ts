import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/auth/google/callback',
        destination: '/auth/callback',
      },
    ];
  },
};

export default nextConfig;
