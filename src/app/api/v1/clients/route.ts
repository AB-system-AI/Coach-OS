import { NextRequest } from "next/server";
import {
  authenticateApiRequest,
  apiResponse,
  apiError,
} from "@/lib/api/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const limit = checkRateLimit(`api:clients:${ip}`);

  if (!limit.allowed) {
    return apiError("Rate limit exceeded", 429);
  }

  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);
  if (ctx.scope === "WRITE") return apiError("Insufficient permissions", 403);

  const clients = await db.clientProfile.findMany({
    where: { tenantId: ctx.tenantId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    take: 100,
  });

  return apiResponse(clients);
}

export async function POST(request: NextRequest) {
  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);
  if (ctx.scope === "READ") return apiError("Insufficient permissions", 403);

  const body = await request.json();
  const { email, name, phone } = body;

  if (!email || !name) {
    return apiError("email and name are required");
  }

  let user = await db.user.findUnique({ where: { email } });
  if (!user) {
    user = await db.user.create({
      data: { email, name, role: "CLIENT" },
    });
  }

  const existing = await db.clientProfile.findUnique({
    where: { userId: user.id },
  });
  if (existing) {
    return apiError("Client already exists", 409);
  }

  const [client] = await db.$transaction([
    db.clientProfile.create({
      data: { tenantId: ctx.tenantId, userId: user.id, phone },
    }),
    db.tenantMember.upsert({
      where: {
        tenantId_userId: { tenantId: ctx.tenantId, userId: user.id },
      },
      update: {},
      create: { tenantId: ctx.tenantId, userId: user.id, role: "CLIENT" },
    }),
  ]);

  return apiResponse(client, 201);
}
