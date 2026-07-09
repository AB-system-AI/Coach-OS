import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";
import { triggerPusherEvent } from "@/lib/pusher/server";

export async function getOrCreateRoom(
  tenantId: string,
  name: string,
  _memberUserIds: string[] = []
) {
  await requireTenantAccess(tenantId);
  return db.chatRoom.create({
    data: { tenantId, name },
  });
}

export async function listRooms(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.chatRoom.findMany({
    where: { tenantId },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { name: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function listMessages(tenantId: string, roomId: string, take = 100) {
  await requireTenantAccess(tenantId);

  const room = await db.chatRoom.findFirst({ where: { id: roomId, tenantId } });
  if (!room) throw new Error("Room not found");

  return db.chatMessage.findMany({
    where: { roomId },
    include: { sender: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "asc" },
    take,
  });
}

export async function sendMessage(
  tenantId: string,
  roomId: string,
  senderId: string,
  content: string
) {
  await requireTenantAccess(tenantId);

  const room = await db.chatRoom.findFirst({ where: { id: roomId, tenantId } });
  if (!room) throw new Error("Room not found");

  const message = await db.chatMessage.create({
    data: { roomId, senderId, content },
    include: { sender: { select: { id: true, name: true, image: true } } },
  });

  await db.chatRoom.update({ where: { id: roomId }, data: { updatedAt: new Date() } });

  await triggerPusherEvent(`room-${roomId}`, "new-message", {
    id: message.id,
    content: message.content,
    sender: message.sender,
    createdAt: message.createdAt,
  });

  return message;
}
