import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hashApiKey } from "@/features/api/services/webhook-dispatcher";

export type ApiContext = {
  tenantId: string;
  apiKeyId: string;
  scope: "READ" | "WRITE" | "FULL";
};

export async function authenticateApiRequest(
  request: NextRequest
): Promise<ApiContext | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const key = authHeader.slice(7);
  const keyHash = hashApiKey(key);

  const apiKey = await db.apiKey.findFirst({
    where: { keyHash, isActive: true },
  });

  if (!apiKey) return null;
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

  await db.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    tenantId: apiKey.tenantId,
    apiKeyId: apiKey.id,
    scope: apiKey.scope,
  };
}

export function apiResponse<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}
