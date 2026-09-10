import { PrismaClient } from "@/generated/prisma/client";
// The "/web" build uses libSQL's HTTP client instead of the native Node
// client. It's required on Cloudflare Workers (no filesystem, no Node
// sockets) and works identically against a remote Turso database from
// plain Node, so the same code path runs everywhere the app does.
import { PrismaLibSql } from "@prisma/adapter-libsql/web";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Reads DATABASE_URL/DATABASE_AUTH_TOKEN from the Cloudflare Workers
 * runtime context when available, falling back to process.env for plain
 * Node (e.g. `next dev`). This intentionally does NOT read process.env
 * first on Workers: Next.js statically inlines whatever a local `.env`
 * file held at build time into the compiled bundle, which would silently
 * shadow the real Cloudflare secret/var at runtime.
 */
function readDatabaseEnv(): { url: string; authToken: string | undefined } {
  try {
    const { env } = getCloudflareContext();
    if (env.DATABASE_URL) {
      return { url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN };
    }
  } catch {
    // Not running on Cloudflare Workers — fall through to process.env.
  }
  return { url: process.env.DATABASE_URL!, authToken: process.env.DATABASE_AUTH_TOKEN };
}

function createPrismaClient(): PrismaClient {
  const { url, authToken } = readDatabaseEnv();
  const adapter = new PrismaLibSql({ url, authToken });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let client: PrismaClient | undefined = globalForPrisma.prisma;

/**
 * A lazily-created singleton. Deliberately not constructed at module
 * evaluation time: Next.js can evaluate this module during `next build`
 * (e.g. while tracing a Server Action referenced from a static page),
 * which would otherwise capture the build machine's own environment
 * instead of the deployed request's.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    if (!client) {
      client = createPrismaClient();
      if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
    }
    return Reflect.get(client as object, prop, receiver);
  },
});
