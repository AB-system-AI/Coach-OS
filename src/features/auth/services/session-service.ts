import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export type ActiveSession = {
  id: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  isCurrent: boolean;
};

export type LoginHistoryEntry = {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  location: string | null;
  success: boolean;
  createdAt: Date;
};

export type UserDeviceEntry = {
  id: string;
  deviceName: string | null;
  deviceType: string | null;
  fingerprint: string | null;
  isTrusted: boolean;
  lastSeenAt: Date;
  createdAt: Date;
};

export async function listSessions(userId: string): Promise<ActiveSession[]> {
  const auth = getAuth();
  const hdrs = await headers();
  const currentSession = await auth.api.getSession({ headers: hdrs });

  const sessions = await db.session.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const currentToken = currentSession?.session?.token;

  return sessions.map((s) => ({
    id: s.id,
    createdAt: s.createdAt,
    expiresAt: s.expiresAt,
    ipAddress: s.ipAddress,
    userAgent: s.userAgent,
    isCurrent: s.token === currentToken,
  }));
}

export async function revokeSession(sessionId: string, userId: string): Promise<void> {
  const session = await db.session.findUnique({
    where: { id: sessionId },
    select: { userId: true, token: true },
  });

  if (!session || session.userId !== userId) {
    throw new Error("Session not found or access denied");
  }

  await db.session.delete({ where: { id: sessionId } });
}

export async function revokeAllOtherSessions(userId: string): Promise<number> {
  const auth = getAuth();
  const hdrs = await headers();
  const currentSession = await auth.api.getSession({ headers: hdrs });
  const currentToken = currentSession?.session?.token;

  const result = await db.session.deleteMany({
    where: {
      userId,
      NOT: currentToken ? { token: currentToken } : undefined,
    },
  });

  return result.count;
}

export async function getLoginHistory(
  userId: string,
  limit = 20
): Promise<LoginHistoryEntry[]> {
  return db.loginHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      ipAddress: true,
      userAgent: true,
      location: true,
      success: true,
      createdAt: true,
    },
  });
}

export async function trackDevice(
  userId: string,
  userAgent: string,
  trusted = false
): Promise<void> {
  const deviceType = /mobile|android|iphone|ipad/i.test(userAgent)
    ? "mobile"
    : /tablet/i.test(userAgent)
    ? "tablet"
    : "desktop";

  const fingerprint = `${userId}:${userAgent.slice(0, 100)}`;

  await db.userDevice.upsert({
    where: { id: fingerprint },
    update: { lastSeenAt: new Date(), isTrusted: trusted },
    create: {
      id: fingerprint,
      userId,
      deviceType,
      fingerprint,
      isTrusted: trusted,
      lastSeenAt: new Date(),
    },
  });
}

export async function recordLogin(
  userId: string,
  opts: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    success?: boolean;
    tenantId?: string;
  }
): Promise<void> {
  await db.loginHistory.create({
    data: {
      userId,
      ipAddress: opts.ipAddress ?? null,
      userAgent: opts.userAgent ?? null,
      location: opts.location ?? null,
      success: opts.success ?? true,
      tenantId: opts.tenantId ?? null,
    },
  });
}

export async function getUserDevices(userId: string): Promise<UserDeviceEntry[]> {
  return db.userDevice.findMany({
    where: { userId },
    orderBy: { lastSeenAt: "desc" },
    select: {
      id: true,
      deviceName: true,
      deviceType: true,
      fingerprint: true,
      isTrusted: true,
      lastSeenAt: true,
      createdAt: true,
    },
  });
}
