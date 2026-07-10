import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";
import { isReservedSlug } from "../../src/features/tenancy/types";
import { slugify } from "../../src/lib/utils";
import { uniqueEmail } from "./constants";

let prisma: PrismaClient | undefined;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

export async function createClientUser(options?: {
  email?: string;
  password?: string;
  tenantSlug?: string;
}) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for createClientUser");
  }

  const db = getPrisma();
  const email = options?.email ?? uniqueEmail("e2e-client");
  const password = options?.password ?? "E2e-Client-Password-2026!";
  const tenantSlug = options?.tenantSlug ?? "apex-performance";
  const hashed = await hashPassword(password);

  const tenant = await db.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) {
    throw new Error(`Tenant not found: ${tenantSlug}`);
  }

  const user = await db.user.create({
    data: {
      name: "E2E Client",
      email,
      emailVerified: true,
      role: "CLIENT",
      memberships: {
        create: {
          tenantId: tenant.id,
          role: "CLIENT",
          isActive: true,
        },
      },
    },
  });

  await db.account.create({
    data: {
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: hashed,
    },
  });

  return { user, email, password, tenantId: tenant.id };
}

export async function provisionCoachWithTenant(options?: {
  email?: string;
  password?: string;
  name?: string;
  businessName?: string;
}) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for provisionCoachWithTenant");
  }

  const db = getPrisma();
  const email = options?.email ?? uniqueEmail("e2e-coach");
  const password = options?.password ?? "E2e-Coach-Password-2026!";
  const name = options?.name ?? "E2E Coach";
  const businessName = options?.businessName ?? `E2E Fitness ${Date.now()}`;
  const hashed = await hashPassword(password);
  const slug = slugify(businessName);

  if (isReservedSlug(slug)) {
    throw new Error(`Reserved slug generated: ${slug}`);
  }

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  const user = await db.user.create({
    data: {
      name,
      email,
      emailVerified: true,
      role: "COACH",
    },
  });

  await db.account.create({
    data: {
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: hashed,
    },
  });

  const tenant = await db.tenant.create({
    data: {
      name: businessName,
      slug,
      plan: "FREE",
      status: "TRIAL",
      trialEndsAt,
      onboardingCompleted: false,
      theme: { create: {} },
      settings: {
        create: { businessName, marketplaceEnabled: true },
      },
      subscription: {
        create: {
          plan: "FREE",
          status: "TRIALING",
          currentPeriodEnd: trialEndsAt,
        },
      },
      members: {
        create: {
          userId: user.id,
          role: "COACH",
        },
      },
    },
  });

  return { user, email, password, tenant, tenantId: tenant.id };
}

export async function getLatestVerificationToken(identifier: string) {
  if (!process.env.DATABASE_URL) return null;

  const db = getPrisma();
  return db.verification.findFirst({
    where: { identifier },
    orderBy: { createdAt: "desc" },
  });
}

export async function markEmailVerified(email: string) {
  if (!process.env.DATABASE_URL) return;

  const db = getPrisma();
  await db.user.update({
    where: { email },
    data: { emailVerified: true },
  });
}

export async function cleanupE2EUsers() {
  if (!process.env.DATABASE_URL) return;

  const db = getPrisma();
  const users = await db.user.findMany({
    where: { email: { endsWith: "@e2e.coachos.app" } },
    select: { id: true },
  });

  if (users.length === 0) return;

  const ids = users.map((u) => u.id);
  const ownedTenants = await db.tenantMember.findMany({
    where: { userId: { in: ids }, role: "COACH" },
    select: { tenantId: true },
  });
  const tenantIds = ownedTenants.map((membership) => membership.tenantId);

  await db.tenantMember.deleteMany({ where: { userId: { in: ids } } });
  await db.session.deleteMany({ where: { userId: { in: ids } } });
  await db.account.deleteMany({ where: { userId: { in: ids } } });
  if (tenantIds.length > 0) {
    await db.tenant.deleteMany({ where: { id: { in: tenantIds } } });
  }
  await db.user.deleteMany({ where: { id: { in: ids } } });
}

export async function disconnectTestDb() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = undefined;
  }
}
