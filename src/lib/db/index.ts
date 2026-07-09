import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export type TenantScopedContext = {
  tenantId: string;
};

export function tenantWhere(tenantId: string) {
  return { tenantId };
}

export async function getTenantBySlug(slug: string) {
  return db.tenant.findUnique({
    where: { slug },
    include: {
      theme: true,
      settings: true,
    },
  });
}

export async function getTenantByDomain(domain: string) {
  return db.tenant.findUnique({
    where: { customDomain: domain },
    include: {
      theme: true,
      settings: true,
    },
  });
}

export async function getTenantMember(tenantId: string, userId: string) {
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
