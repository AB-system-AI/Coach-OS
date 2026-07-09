import { NextRequest } from "next/server";
import { authenticateApiRequest, apiResponse, apiError } from "@/lib/api/auth";
import { createPayment } from "@/features/payments/services/payment-service";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);

  const payments = await db.payment.findMany({
    where: { tenantId: ctx.tenantId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return apiResponse(payments);
}

export async function POST(request: NextRequest) {
  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);

  const body = await request.json();
  const result = await createPayment(ctx.tenantId, body);
  return apiResponse(result, 201);
}
