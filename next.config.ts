import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Avoid Turbopack inlining a stale generated Prisma engine (missing new Lead fields). */
  serverExternalPackages: ["@prisma/client"]
};

export default nextConfig;
