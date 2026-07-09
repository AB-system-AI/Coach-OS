import { NextRequest } from "next/server";
import { authenticateApiRequest, apiResponse, apiError } from "@/lib/api/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);

  const userId = request.nextUrl.searchParams.get("userId");
  if (userId) {
    const [weights, measurements, photos] = await Promise.all([
      db.weightEntry.findMany({ where: { userId }, orderBy: { recordedAt: "asc" } }),
      db.bodyMeasurement.findMany({ where: { userId }, orderBy: { recordedAt: "desc" } }),
      db.progressPhoto.findMany({ where: { userId }, orderBy: { recordedAt: "desc" } }),
    ]);
    return apiResponse({ weights, measurements, photos });
  }

  const checkIns = await db.weeklyCheckIn.findMany({
    where: { tenantId: ctx.tenantId, status: "PENDING" },
    include: { client: { include: { user: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return apiResponse(checkIns);
}

export async function POST(request: NextRequest) {
  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);

  const body = await request.json();
  const checkIn = await db.weeklyCheckIn.create({
    data: {
      tenantId: ctx.tenantId,
      clientId: body.clientId,
      userId: body.userId,
      weekStartDate: new Date(body.weekStartDate),
      weight: body.weight,
      adherenceScore: body.adherenceScore,
      programRating: body.programRating,
      notes: body.notes,
      photoUrls: body.photoUrls ?? [],
      status: "PENDING",
    },
  });
  return apiResponse(checkIn, 201);
}
