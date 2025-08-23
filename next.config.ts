import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["img.clerk.com", "images.unsplash.com"],
    // Or if you're using a newer version of Next.js, use remotePatterns:
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'img.clerk.com',
    //   },
    // ],
  },
};

export default nextConfig;
