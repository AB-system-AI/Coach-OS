import { createHmac, randomBytes, createHash } from "crypto";
import { db } from "@/lib/db";
import type { WebhookEvent } from "@prisma/client";

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = `cos_${randomBytes(32).toString("hex")}`;
  const hash = createHash("sha256").update(key).digest("hex");
  const prefix = key.slice(0, 12);
  return { key, hash, prefix };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function dispatchWebhook(
  tenantId: string,
  event: WebhookEvent,
  payload: Record<string, unknown>
) {
  const endpoints = await db.webhookEndpoint.findMany({
    where: { tenantId, isActive: true, events: { has: event } },
  });

  const results = await Promise.allSettled(
    endpoints.map(async (endpoint) => {
      const body = JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        data: payload,
      });

      const signature = createHmac("sha256", endpoint.secret)
        .update(body)
        .digest("hex");

      const response = await fetch(endpoint.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CoachOS-Event": event,
          "X-CoachOS-Signature": signature,
        },
        body,
        signal: AbortSignal.timeout(10000),
      });

      await db.webhookDelivery.create({
        data: {
          endpointId: endpoint.id,
          event,
          payload: payload as object,
          statusCode: response.status,
          response: await response.text().catch(() => null),
          success: response.ok,
        },
      });

      return response.ok;
    })
  );

  return results;
}
