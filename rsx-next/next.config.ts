import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — deployable to GitHub Pages like the original site
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // The parent repo has its own package-lock.json — pin the workspace root
  turbopack: { root: __dirname },
};

export default nextConfig;
