import { authenticateApiRequest, apiResponse, apiError } from "@/lib/api/auth";
import { db } from "@/lib/db";
import type { NextRequest } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  userId: z.string(),
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);

  const body = registerSchema.parse(await request.json());

  const existing = await db.pushSubscription.findUnique({
    where: { endpoint: body.endpoint },
  });

  const sub = existing
    ? await db.pushSubscription.update({
        where: { endpoint: body.endpoint },
        data: {
          userId: body.userId,
          tenantId: ctx.tenantId,
          p256dh: body.keys.p256dh,
          auth: body.keys.auth,
        },
      })
    : await db.pushSubscription.create({
        data: {
          userId: body.userId,
          tenantId: ctx.tenantId,
          endpoint: body.endpoint,
          p256dh: body.keys.p256dh,
          auth: body.keys.auth,
        },
      });

  return apiResponse({ id: sub.id, registered: true });
}
