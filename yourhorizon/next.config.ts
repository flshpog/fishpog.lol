import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/yourhorizon",
  assetPrefix: "/yourhorizon/",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
