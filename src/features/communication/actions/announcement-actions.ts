"use server";

import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const announcementSchema = z.object({
  tenantId: z.string(),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  endsAt: z.string().datetime().optional(),
});

export async function createAnnouncement(
  input: z.infer<typeof announcementSchema>
) {
  const data = announcementSchema.parse(input);
  await requireTenantAccess(data.tenantId);

  const announcement = await db.tenantAnnouncement.create({
    data: {
      tenantId: data.tenantId,
      title: data.title,
      content: data.content,
      endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
    },
  });

  const clients = await db.tenantMember.findMany({
    where: { tenantId: data.tenantId, role: "CLIENT", isActive: true },
    select: { userId: true },
  });

  if (clients.length > 0) {
    await db.notification.createMany({
      data: clients.map((c) => ({
        tenantId: data.tenantId,
        userId: c.userId,
        type: "ANNOUNCEMENT" as const,
        channel: "IN_APP" as const,
        title: data.title,
        message: data.content.slice(0, 200),
        data: { announcementId: announcement.id },
      })),
    });
  }

  revalidatePath("/dashboard/announcements");
  return announcement;
}

export async function getActiveAnnouncements(tenantId: string) {
  return db.tenantAnnouncement.findMany({
    where: {
      tenantId,
      isActive: true,
      OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deactivateAnnouncement(
  tenantId: string,
  announcementId: string
) {
  await requireTenantAccess(tenantId);

  return db.tenantAnnouncement.update({
    where: { id: announcementId, tenantId },
    data: { isActive: false },
  });
}
