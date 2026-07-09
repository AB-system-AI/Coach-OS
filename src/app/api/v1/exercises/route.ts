import { NextRequest } from "next/server";
import { authenticateApiRequest, apiResponse, apiError } from "@/lib/api/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);

  const exercises = await db.exerciseVideo.findMany({
    where: { tenantId: ctx.tenantId },
    orderBy: { title: "asc" },
  });
  return apiResponse(exercises);
}

export async function POST(request: NextRequest) {
  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);

  const body = await request.json();
  const exercise = await db.exerciseVideo.create({
    data: { tenantId: ctx.tenantId, ...body },
  });
  return apiResponse(exercise, 201);
}
