import { authenticateApiRequest, apiResponse, apiError } from "@/lib/api/auth";
import { db } from "@/lib/db";
import type { NextRequest } from "next/server";
import { z } from "zod";

// Extended entity types for API (superset of DB enum)
const syncItemSchema = z.object({
  entityType: z.string(),
  entityId: z.string().optional(),
  payload: z.record(z.unknown()).default({}),
});

const syncSchema = z.object({
  clientId: z.string().optional(),
  userId: z.string().optional(),
  items: z.array(syncItemSchema).default([]),
});

// Map extended types to DB-valid SyncEntityType
type DbSyncEntityType = "BOOKING" | "PROGRAM" | "MEAL" | "PROGRESS" | "MESSAGE" | "PAYMENT";

function mapEntityType(entityType: string): DbSyncEntityType {
  const map: Record<string, DbSyncEntityType> = {
    WEIGHT_ENTRY: "PROGRESS",
    BODY_MEASUREMENT: "PROGRESS",
    WEEKLY_CHECKIN: "PROGRESS",
    PROGRESS: "PROGRESS",
    BOOKING: "BOOKING",
    PROGRAM: "PROGRAM",
    MEAL: "MEAL",
    MESSAGE: "MESSAGE",
    PAYMENT: "PAYMENT",
  };
  return map[entityType] ?? "PROGRESS";
}

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

  let body: z.infer<typeof syncSchema>;
  try {
    body = syncSchema.parse(await request.json());
  } catch {
    return apiError("Invalid request body", 400);
  }

  const errors: { type: string; error: string }[] = [];
  let processedCount = 0;

  for (const item of body.items) {
    try {
      const userId = body.userId ?? ctx.apiKeyId;
      await applyPayload(ctx.tenantId, userId, item.entityType, item.payload);
      processedCount++;
    } catch (err) {
      errors.push({
        type: item.entityType,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (body.items.length > 0) {
    await db.offlineSyncQueue.createMany({
      data: body.items.map((item) => ({
        tenantId: ctx.tenantId,
        userId: body.userId ?? ctx.apiKeyId,
        entityType: mapEntityType(item.entityType),
        entityId: item.entityId,
        payload: item.payload as object,
        clientId: body.clientId,
        status: "SYNCED" as const,
        syncedAt: new Date(),
      })),
      skipDuplicates: true,
    });
  }

  return apiResponse({
    synced: processedCount,
    total: body.items.length,
    errors,
    serverTime: new Date().toISOString(),
  });
}

async function applyPayload(
  tenantId: string,
  userId: string,
  entityType: string,
  payload: Record<string, unknown>
) {
  switch (entityType) {
    case "WEIGHT_ENTRY":
    case "PROGRESS": {
      const weight = Number(payload.weight);
      if (isNaN(weight) || weight <= 0) break;
      await db.weightEntry.create({
        data: {
          userId,
          weight,
          unit: (payload.unit as string) ?? "kg",
          notes: payload.notes as string | undefined,
          recordedAt: payload.recordedAt ? new Date(payload.recordedAt as string) : new Date(),
        },
      });
      break;
    }

    case "BODY_MEASUREMENT": {
      await db.bodyMeasurement.create({
        data: {
          userId,
          chest: payload.chest ? Number(payload.chest) : undefined,
          waist: payload.waist ? Number(payload.waist) : undefined,
          hips: payload.hips ? Number(payload.hips) : undefined,
          biceps: payload.biceps ? Number(payload.biceps) : undefined,
          thighs: payload.thighs ? Number(payload.thighs) : undefined,
          bodyFat: payload.bodyFat ? Number(payload.bodyFat) : undefined,
          notes: payload.notes as string | undefined,
          recordedAt: payload.recordedAt ? new Date(payload.recordedAt as string) : new Date(),
        },
      });
      break;
    }

    case "WEEKLY_CHECKIN": {
      const client = await db.clientProfile.findFirst({ where: { userId, tenantId } });
      if (!client) throw new Error("Client profile not found");

      await db.weeklyCheckIn.create({
        data: {
          tenantId,
          clientId: client.id,
          userId,
          weekStartDate: payload.weekStartDate ? new Date(payload.weekStartDate as string) : new Date(),
          weight: payload.weight ? Number(payload.weight) : undefined,
          bodyFatPercent: payload.bodyFatPercent ? Number(payload.bodyFatPercent) : undefined,
          adherenceScore: payload.adherenceScore ? Number(payload.adherenceScore) : undefined,
          programRating: payload.programRating ? Number(payload.programRating) : undefined,
          notes: payload.notes as string | undefined,
        },
      });
      break;
    }

    case "MESSAGE": {
      const roomId = payload.roomId as string | undefined;
      const content = payload.content as string | undefined;
      if (!roomId || !content) throw new Error("roomId and content required for MESSAGE");

      const room = await db.chatRoom.findFirst({ where: { id: roomId, tenantId } });
      if (!room) throw new Error("Room not found");

      await db.chatMessage.create({
        data: { roomId, senderId: userId, content },
      });
      break;
    }

    default:
      console.log(`[mobile-sync] Unhandled entity type: ${entityType}`, payload);
  }
}
