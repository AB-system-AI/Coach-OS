import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";
import { logClientActivity } from "@/lib/activity";
import { writeAuditLog } from "@/lib/audit";
import type { ClientGoalType, ClientSubscriptionStatus } from "@prisma/client";

export async function getClients(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.clientProfile.findMany({
    where: { tenantId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      _count: {
        select: {
          notes: true,
          files: true,
          activities: true,
          weeklyCheckIns: true,
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });
}

export async function getClientById(tenantId: string, clientId: string) {
  await requireTenantAccess(tenantId);
  return db.clientProfile.findFirst({
    where: { id: clientId, tenantId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      notes: { orderBy: { createdAt: "desc" }, take: 20 },
      files: { orderBy: { createdAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" }, take: 50 },
      weeklyCheckIns: { orderBy: { weekStartDate: "desc" }, take: 10 },
    },
  });
}

export async function createClient(
  tenantId: string,
  data: {
    email: string;
    name: string;
    phone?: string;
    goals?: string;
    goalType?: ClientGoalType;
    height?: number;
  },
  authorId?: string
) {
  await requireTenantAccess(tenantId);

  let user = await db.user.findUnique({ where: { email: data.email } });
  if (!user) {
    user = await db.user.create({
      data: { email: data.email, name: data.name, role: "CLIENT" },
    });
  }

  const existing = await db.clientProfile.findUnique({
    where: { userId: user.id },
  });
  if (existing) throw new Error("Client already exists");

  const client = await db.$transaction(async (tx) => {
    const profile = await tx.clientProfile.create({
      data: {
        tenantId,
        userId: user!.id,
        phone: data.phone,
        goals: data.goals,
        goalType: data.goalType,
        height: data.height,
        subscriptionStatus: "ACTIVE",
        subscriptionStartDate: new Date(),
      },
    });
    await tx.tenantMember.upsert({
      where: { tenantId_userId: { tenantId, userId: user!.id } },
      update: {},
      create: { tenantId, userId: user!.id, role: "CLIENT" },
    });
    return profile;
  });

  await logClientActivity({
    tenantId,
    clientId: client.id,
    type: "ENROLLMENT",
    title: "Client joined",
    description: `${data.name} was added as a client`,
  });

  await writeAuditLog({
    tenantId,
    userId: authorId,
    action: "CREATE",
    entity: "ClientProfile",
    entityId: client.id,
  });

  return client;
}

export async function updateClient(
  tenantId: string,
  clientId: string,
  data: Partial<{
    phone: string;
    goals: string;
    goalType: ClientGoalType;
    height: number;
    medicalNotes: string;
    subscriptionStatus: ClientSubscriptionStatus;
    subscriptionEndDate: Date;
    isActive: boolean;
  }>,
  authorId?: string
) {
  await requireTenantAccess(tenantId);
  const client = await db.clientProfile.update({
    where: { id: clientId, tenantId },
    data,
  });
  await writeAuditLog({
    tenantId,
    userId: authorId,
    action: "UPDATE",
    entity: "ClientProfile",
    entityId: clientId,
  });
  return client;
}

export async function addClientNote(
  tenantId: string,
  clientId: string,
  authorId: string,
  content: string
) {
  await requireTenantAccess(tenantId);
  const note = await db.clientNote.create({
    data: { tenantId, clientId, authorId, content },
  });
  await logClientActivity({
    tenantId,
    clientId,
    type: "NOTE",
    title: "Note added",
    description: content.slice(0, 120),
  });
  return note;
}

export async function addClientFile(
  tenantId: string,
  clientId: string,
  data: { name: string; url: string; mimeType?: string; sizeBytes?: number }
) {
  await requireTenantAccess(tenantId);
  return db.clientFile.create({
    data: { tenantId, clientId, ...data },
  });
}

export async function getClientStats(tenantId: string) {
  await requireTenantAccess(tenantId);
  const [total, active, expired] = await Promise.all([
    db.clientProfile.count({ where: { tenantId } }),
    db.clientProfile.count({ where: { tenantId, isActive: true, subscriptionStatus: "ACTIVE" } }),
    db.clientProfile.count({ where: { tenantId, subscriptionStatus: "EXPIRED" } }),
  ]);
  return { total, active, expired };
}
