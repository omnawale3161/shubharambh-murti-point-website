import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

/** @type {import('next').NextConfig} */
export default function nextConfig(phase) {
  return {
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
    allowedDevOrigins: ["127.0.0.1"],
    devIndicators: false,
    images: {
      formats: ["image/avif", "image/webp"],
      qualities: [65, 68, 72, 75, 78, 82],
      deviceSizes: [360, 640, 768, 1024, 1280, 1536],
      imageSizes: [48, 64, 96, 128, 256],
      minimumCacheTTL: 2592000,
      remotePatterns: [
        {
          protocol: "https",
          hostname: "**"
        },
        {
          protocol: "http",
          hostname: "**"
        }
      ]
    }
  };
}
