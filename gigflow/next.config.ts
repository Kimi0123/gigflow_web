import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.112.154"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
