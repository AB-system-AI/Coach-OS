import { NextRequest } from "next/server";
import { authenticateApiRequest, apiResponse, apiError } from "@/lib/api/auth";
import { processAIRequest } from "@/features/ai";

export async function POST(request: NextRequest) {
  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);

  const { message, type, userId, context } = await request.json();
  if (!message) return apiError("message required");

  const result = await processAIRequest({
    tenantId: ctx.tenantId,
    userId: userId ?? ctx.apiKeyId,
    type: type ?? "COACH_ASSISTANT",
    prompt: message,
    context,
  });

  return apiResponse(result);
}
