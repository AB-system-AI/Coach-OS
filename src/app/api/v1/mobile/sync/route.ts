import { authenticateApiRequest, apiResponse, apiError } from "@/lib/api/auth";
import { db } from "@/lib/db";
import type { NextRequest } from "next/server";
import { z } from "zod";

const syncSchema = z.object({
  clientId: z.string().optional(),
  items: z
    .array(
      z.object({
        entityType: z.enum([
          "BOOKING",
          "PROGRAM",
          "MEAL",
          "PROGRESS",
          "MESSAGE",
          "PAYMENT",
        ]),
        entityId: z.string().optional(),
        payload: z.record(z.unknown()).default({}),
      })
    )
    .default([]),
});

export async function GET(request: NextRequest) {
  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);

  const pending = await db.offlineSyncQueue.findMany({
    where: { tenantId: ctx.tenantId, status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return apiResponse({ pending, serverTime: new Date().toISOString() });
}

export async function POST(request: NextRequest) {
  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);

  const body = syncSchema.parse(await request.json());

  const created = await db.offlineSyncQueue.createMany({
    data: body.items.map((item) => ({
      tenantId: ctx.tenantId,
      userId: ctx.apiKeyId,
      entityType: item.entityType,
      entityId: item.entityId,
      payload: item.payload as object,
      clientId: body.clientId,
      status: "PENDING",
    })),
  });

  const ackIds = await db.offlineSyncQueue.findMany({
    where: {
      tenantId: ctx.tenantId,
      clientId: body.clientId,
      status: "PENDING",
    },
    select: { id: true },
    take: created.count,
  });

  if (ackIds.length > 0) {
    await db.offlineSyncQueue.updateMany({
      where: { id: { in: ackIds.map((a) => a.id) } },
      data: { status: "SYNCED", syncedAt: new Date() },
    });
  }

  return apiResponse({
    synced: created.count,
    serverTime: new Date().toISOString(),
  });
}
