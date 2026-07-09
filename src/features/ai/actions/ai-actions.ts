"use server";

import { requireAuth, requireTenantAccess } from "@/lib/auth/session";
import {
  processAIRequest,
  getAIConversations,
} from "@/features/ai/services/ai-service";
import type { AIConversationType } from "@prisma/client";
import { z } from "zod";

const aiRequestSchema = z.object({
  tenantId: z.string(),
  type: z.enum([
    "COACH_ASSISTANT",
    "MEAL_SUGGESTION",
    "WORKOUT_SUGGESTION",
    "PROGRESS_SUMMARY",
    "CLIENT_INSIGHTS",
  ]),
  prompt: z.string().min(1).max(2000),
  context: z.record(z.unknown()).optional(),
});

export async function sendAIRequest(input: z.infer<typeof aiRequestSchema>) {
  const data = aiRequestSchema.parse(input);
  const { session } = await requireTenantAccess(data.tenantId);

  return processAIRequest({
    tenantId: data.tenantId,
    userId: session.user.id,
    type: data.type as AIConversationType,
    prompt: data.prompt,
    context: data.context,
  });
}

export async function fetchAIHistory(tenantId: string) {
  const session = await requireAuth();
  await requireTenantAccess(tenantId);
  return getAIConversations(tenantId, session.user.id);
}
