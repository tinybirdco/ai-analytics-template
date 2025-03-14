import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  webpack: (config) => {
    config.devtool = 'source-map';
    return config;
  },
};

export default nextConfig;
