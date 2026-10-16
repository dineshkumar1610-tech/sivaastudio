/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    // Configured image qualities allowed by next/image
    qualities: [70, 72, 75],
    // Serve WebP/AVIF automatically for supported browsers
    formats: ["image/webp", "image/avif"],
    // Device widths to generate srcsets for
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    // Cache optimized images for 60 days
    minimumCacheTTL: 60 * 60 * 24 * 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  // Enable compression
  compress: true,
};

export default nextConfig;

