import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { UserRole } from "@prisma/client";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(...roles: UserRole[]) {
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
  const session = await getSession();
  if (!session?.user) return null;

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
}
