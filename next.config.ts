import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "img.clerk.com",
      "images.unsplash.com",
      "unsplash.com",
      "youtu.be", // Note: YouTube is typically for embeds, not images
      "www.memeraki.com",
      "i.ytimg.com", // YouTube thumbnail images
      "media.istockphoto.com",
      "shop.gaatha.com",
      "www.utsavpedia.com",
      "5.imimg.com",
      "encrypted-tbn0.gstatic.com",
      "www.indianvillez.com",
      "cdn.shopify.com", // www.indianvillez.com uses Shopify CDN
      "images.unsplash.com",
    ],
    // For newer Next.js versions, use remotePatterns instead:
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
      {
        protocol: "https",
        hostname: "youtu.be",
      },
      {
        protocol: "https",
        hostname: "www.memeraki.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "media.istockphoto.com",
      },
      {
        protocol: "https",
        hostname: "shop.gaatha.com",
      },
      {
        protocol: "https",
        hostname: "www.utsavpedia.com",
      },
      {
        protocol: "https",
        hostname: "5.imimg.com",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "www.indianvillez.com",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
};

export default nextConfig;
