import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { db, assertDatabaseConfigured, isDatabaseConfigured } from "@/lib/db";
import { ServiceUnavailableError } from "@/lib/deployment/errors";
import type { UserRole } from "@prisma/client";

export async function getSession() {
  if (!isDatabaseConfigured()) return null;

  try {
    const session = await getAuth().api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    console.error("[CoachOS] getSession failed:", error);
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(...roles: UserRole[]) {
  assertDatabaseConfigured();
  const session = await requireAuth();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || !roles.includes(user.role)) {
    throw new Error("Forbidden");
  }

  return { session, user };
}

export async function requireTenantAccess(tenantId: string) {
  assertDatabaseConfigured();
  const session = await requireAuth();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role === "SUPER_ADMIN") {
    return { session, user, membership: null };
  }

  const membership = await db.tenantMember.findUnique({
    where: {
      tenantId_userId: { tenantId, userId: session.user.id },
    },
  });

  if (!membership || !membership.isActive) {
    throw new Error("Forbidden");
  }

  return { session, user, membership };
}

export async function getCurrentTenant() {
  if (!isDatabaseConfigured()) {
    throw new ServiceUnavailableError(
      "database",
      "Database is not configured."
    );
  }

  assertDatabaseConfigured();
  const session = await getSession();
  if (!session?.user) return null;

  try {
    const membership = await db.tenantMember.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
        role: { in: ["COACH", "ASSISTANT_COACH"] },
      },
      include: {
        tenant: {
          include: { theme: true, settings: true },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    return membership?.tenant ?? null;
  } catch (error) {
    console.error("[CoachOS] getCurrentTenant failed:", error);
    throw new ServiceUnavailableError(
      "database",
      "Unable to load tenant context."
    );
  }
}
