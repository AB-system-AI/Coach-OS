"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function submitWeightEntry(data: { weight: number; unit?: string; notes?: string }) {
  const session = await requireAuth();

  await db.weightEntry.create({
    data: {
      userId: session.user.id,
      weight: data.weight,
      unit: data.unit ?? "kg",
      notes: data.notes,
    },
  });

  revalidatePath("/portal/progress");
}

export async function markNotificationRead(notificationId: string) {
  const session = await requireAuth();

  await db.notification.update({
    where: { id: notificationId, userId: session.user.id },
    data: { isRead: true, readAt: new Date() },
  });

  revalidatePath("/portal/notifications");
}

export async function markAllNotificationsRead() {
  const session = await requireAuth();

  const membership = await db.tenantMember.findFirst({
    where: { userId: session.user.id, role: "CLIENT", isActive: true },
  });
  if (!membership) return;

  await db.notification.updateMany({
    where: { userId: session.user.id, tenantId: membership.tenantId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  revalidatePath("/portal/notifications");
}

const sendMessageSchema = z.object({
  roomId: z.string(),
  content: z.string().min(1).max(5000),
});

export async function sendPortalMessage(input: z.infer<typeof sendMessageSchema>) {
  const session = await requireAuth();
  const data = sendMessageSchema.parse(input);

  const room = await db.chatRoom.findFirst({
    where: { id: data.roomId },
  });

  if (!room) throw new Error("Room not found or access denied");

  const message = await db.chatMessage.create({
    data: {
      roomId: data.roomId,
      senderId: session.user.id,
      content: data.content,
    },
    include: { sender: { select: { id: true, name: true } } },
  });

  await db.chatRoom.update({
    where: { id: data.roomId },
    data: { updatedAt: new Date() },
  });

  revalidatePath(`/portal/messages/${data.roomId}`);
  return message;
}

export async function getOrCreateDirectRoom(coachUserId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const membership = await db.tenantMember.findFirst({
    where: { userId, role: "CLIENT", isActive: true },
  });
  if (!membership) throw new Error("No tenant membership found");

  const userName = session.user.name ?? "Client";
  const coachUser = await db.user.findUnique({ where: { id: coachUserId }, select: { name: true } });

  return db.chatRoom.create({
    data: {
      tenantId: membership.tenantId,
      name: `${userName} & ${coachUser?.name ?? "Coach"}`,
    },
  });
}
