import { PrismaClient } from "@prisma/client";
import {
  isRuntimeDatabaseConfigured,
  requireDatabaseUrl,
  resolveDatabaseUrl,
} from "@/lib/env";
import { ServiceUnavailableError } from "@/lib/deployment/errors";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url: resolveDatabaseUrl(),
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/**
 * Lazy Prisma proxy — does not connect until first query.
 * Avoids crashing module evaluation when DATABASE_URL is unset at build time.
 */
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

/** Non-throwing check used by guards and health endpoints. */
export function isDatabaseConfigured(): boolean {
  return isRuntimeDatabaseConfigured();
}

/** Call at the start of server handlers that must have a real database. */
export function assertDatabaseConfigured(): void {
  if (!isDatabaseConfigured()) {
    throw new ServiceUnavailableError(
      "database",
      "[CoachOS] DATABASE_URL is not configured."
    );
  }
  requireDatabaseUrl();
}

let lastConnectionCheck: { at: number; ok: boolean } | undefined;
const CONNECTION_CHECK_TTL_MS = 10_000;

/** Ping database with short-lived cache (for layout guards). */
export async function checkDatabaseConnection(): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;

  const now = Date.now();
  if (
    lastConnectionCheck &&
    now - lastConnectionCheck.at < CONNECTION_CHECK_TTL_MS
  ) {
    return lastConnectionCheck.ok;
  }

  try {
    await db.$queryRaw`SELECT 1`;
    lastConnectionCheck = { at: now, ok: true };
    return true;
  } catch (error) {
    console.error("[CoachOS] Database connection check failed:", error);
    lastConnectionCheck = { at: now, ok: false };
    return false;
  }
}

export type TenantScopedContext = {
  tenantId: string;
};

export function tenantWhere(tenantId: string) {
  return { tenantId };
}

export async function getTenantBySlug(slug: string) {
  assertDatabaseConfigured();
  return db.tenant.findUnique({
    where: { slug },
    include: {
      theme: true,
      settings: true,
    },
  });
}

export async function getTenantByDomain(domain: string) {
  assertDatabaseConfigured();
  return db.tenant.findUnique({
    where: { customDomain: domain },
    include: {
      theme: true,
      settings: true,
    },
  });
}

export async function getTenantMember(tenantId: string, userId: string) {
  assertDatabaseConfigured();
  return db.tenantMember.findUnique({
    where: {
      tenantId_userId: { tenantId, userId },
    },
    include: {
      tenant: { include: { theme: true, settings: true } },
      user: true,
    },
  });
}
