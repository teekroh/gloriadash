import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Avoid Turbopack inlining a stale generated Prisma engine (missing new Lead fields). */
  serverExternalPackages: ["@prisma/client"],
  /**
   * Ensure the resources/ directory (CSV lead file, logo) is bundled into
   * every serverless function that needs it at runtime on Vercel.
   */
  outputFileTracingIncludes: {
    "/dashboard": ["./resources/**"],
    "/api/dashboard": ["./resources/**"],
    "/api/cron/outreach-dispatch": ["./resources/**"],
    "/api/campaigns/launch": ["./resources/**"],
  },
};

export default nextConfig;
