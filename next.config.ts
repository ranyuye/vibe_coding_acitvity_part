import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.AWESOME_DEPLOY_BUILD === "1" ? { output: "standalone" as const } : {}),
};

export default nextConfig;
