import { PrismaClient } from "@prisma/client";
import { requireDatabaseUrl, resolveDatabaseUrl } from "@/lib/env";

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

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

/** Call at the start of server handlers that must have a real database. */
export function assertDatabaseConfigured(): void {
  requireDatabaseUrl();
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
