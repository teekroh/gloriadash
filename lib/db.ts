import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";
import { readFileSync, statSync } from "fs";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __prisma_schema_hash: string | undefined;
}

/**
 * Changes when `schema.prisma` changes or `prisma generate` refreshes `node_modules/.prisma/client`.
 * Prevents holding a PrismaClient whose DMMF is out of sync with disk.
 */
function prismaClientFingerprint(): string {
  try {
    const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
    const clientPath = path.join(process.cwd(), "node_modules", ".prisma", "client", "index.js");
    const schemaBuf = readFileSync(schemaPath);
    const st = statSync(clientPath);
    const h = createHash("sha256");
    h.update(schemaBuf);
    h.update(`${st.size}:${Math.floor(st.mtimeMs)}`);
    return h.digest("hex").slice(0, 16);
  } catch {
    return "unknown";
  }
}

/**
 * Recreate the singleton when the schema or generated client changes (dev HMR / after `prisma generate`).
 * `serverExternalPackages: ["@prisma/client"]` in next.config keeps Turbopack from baking in a stale engine.
 */
function getPrisma(): PrismaClient {
  const h = prismaClientFingerprint();
  if (global.__prisma_schema_hash !== h) {
    void global.prisma?.$disconnect().catch(() => {});
    global.prisma = undefined;
    global.__prisma_schema_hash = h;
  }
  return (global.prisma ??= new PrismaClient());
}

export const db = getPrisma();
