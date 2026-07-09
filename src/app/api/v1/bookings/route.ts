import { NextRequest } from "next/server";
import { authenticateApiRequest, apiResponse, apiError } from "@/lib/api/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);

  const status = request.nextUrl.searchParams.get("status");
  const bookings = await db.booking.findMany({
    where: {
      tenantId: ctx.tenantId,
      ...(status ? { status: status as "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW" } : {}),
    },
    include: {
      user: { select: { name: true, email: true } },
      service: { select: { name: true } },
    },
    orderBy: { date: "desc" },
    take: 100,
  });
  return apiResponse(bookings);
}

export async function POST(request: NextRequest) {
  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);

  const body = await request.json();
  const booking = await db.booking.create({
    data: {
      tenantId: ctx.tenantId,
      userId: body.userId,
      serviceId: body.serviceId,
      date: new Date(body.date),
      startTime: body.startTime,
      endTime: body.endTime,
      price: body.price,
      notes: body.notes,
      status: "PENDING",
      currency: "USD",
    },
  });
  return apiResponse(booking, 201);
}
