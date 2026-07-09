import { NextRequest } from "next/server";
import { authenticateApiRequest, apiResponse, apiError } from "@/lib/api/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);

  const programs = await db.program.findMany({
    where: { tenantId: ctx.tenantId },
    include: { _count: { select: { workoutPlans: true, enrollments: true } } },
    orderBy: { createdAt: "desc" },
  });
  return apiResponse(programs);
}

export async function POST(request: NextRequest) {
  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);
  if (ctx.scope === "READ") return apiError("Insufficient permissions", 403);

  const body = await request.json();
  const slug = `${body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
  const program = await db.program.create({
    data: {
      tenantId: ctx.tenantId,
      name: body.name,
      slug,
      description: body.description,
      durationWeeks: body.durationWeeks,
      price: body.price ?? 0,
      status: "DRAFT",
    },
  });
  return apiResponse(program, 201);
}
