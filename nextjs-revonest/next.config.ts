import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Hide the "N" dev indicator in the corner (it shows up in screenshots).
  // Build and runtime errors are still shown in development.
  devIndicators: false,
  // Product management moved from /dashboard/products to /dashboard. Keep the
  // old URL working. Temporary (307) so browsers don't cache it forever.
  async redirects() {
    return [
      { source: "/dashboard/products", destination: "/dashboard", permanent: false },
    ];
  },
  images: {
    // Product images are served locally from /public/images. placehold.co is
    // only used as a fallback for any product without a local image.
    remotePatterns: [{ protocol: "https", hostname: "placehold.co" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
