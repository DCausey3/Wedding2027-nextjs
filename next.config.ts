import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Allow Next.js Image to load from Unsplash and other CDNs
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // Required for AWS Amplify SSR
  // When deploying to Amplify Hosting, set output to 'standalone'
  // output: "standalone",
};

export default nextConfig;
