import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";
import { logClientActivity } from "@/lib/activity";

export async function getClientProgress(tenantId: string, clientId: string) {
  await requireTenantAccess(tenantId);
  const client = await db.clientProfile.findFirst({
    where: { id: clientId, tenantId },
    include: { user: true },
  });
  if (!client) return null;

  const [weights, measurements, photos, checkIns] = await Promise.all([
    db.weightEntry.findMany({
      where: { userId: client.userId },
      orderBy: { recordedAt: "asc" },
    }),
    db.bodyMeasurement.findMany({
      where: { userId: client.userId },
      orderBy: { recordedAt: "desc" },
      take: 20,
    }),
    db.progressPhoto.findMany({
      where: { userId: client.userId },
      orderBy: { recordedAt: "desc" },
    }),
    db.weeklyCheckIn.findMany({
      where: { clientId },
      orderBy: { weekStartDate: "desc" },
    }),
  ]);

  const latestWeight = weights[weights.length - 1]?.weight;
  const heightM = client.height ? client.height / 100 : null;
  const bmi =
    latestWeight && heightM ? Number((latestWeight / (heightM * heightM)).toFixed(1)) : null;

  return { client, weights, measurements, photos, checkIns, bmi, latestWeight };
}

export async function addWeightEntry(userId: string, weight: number, notes?: string) {
  return db.weightEntry.create({
    data: { userId, weight, notes },
  });
}

export async function submitWeeklyCheckIn(
  tenantId: string,
  clientId: string,
  userId: string,
  data: {
    weekStartDate: Date;
    weight?: number;
    bodyFatPercent?: number;
    adherenceScore?: number;
    programRating?: number;
    notes?: string;
    photoUrls?: string[];
  }
) {
  const checkIn = await db.weeklyCheckIn.create({
    data: {
      tenantId,
      clientId,
      userId,
      ...data,
      status: "PENDING",
    },
  });

  if (data.weight) {
    await addWeightEntry(userId, data.weight);
  }

  await logClientActivity({
    tenantId,
    clientId,
    type: "CHECK_IN",
    title: "Weekly check-in submitted",
    description: data.notes,
  });

  return checkIn;
}

export async function replyToCheckIn(
  tenantId: string,
  checkInId: string,
  coachReply: string
) {
  await requireTenantAccess(tenantId);
  return db.weeklyCheckIn.update({
    where: { id: checkInId },
    data: { coachReply, coachRepliedAt: new Date(), status: "REVIEWED" },
  });
}

export async function getPendingCheckIns(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.weeklyCheckIn.findMany({
    where: { tenantId, status: "PENDING" },
    include: {
      client: { include: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProgressStats(tenantId: string) {
  await requireTenantAccess(tenantId);
  const [pendingCheckIns, clients] = await Promise.all([
    db.weeklyCheckIn.count({ where: { tenantId, status: "PENDING" } }),
    db.clientProfile.count({ where: { tenantId, isActive: true } }),
  ]);
  return { pendingCheckIns, clients };
}
