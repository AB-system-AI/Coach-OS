import { authenticateApiRequest, apiResponse, apiError } from "@/lib/api/auth";
import { db } from "@/lib/db";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);

  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) return apiError("userId required", 400);

  const [profile, bookings, enrollments, payments, notifications] =
    await Promise.all([
      db.clientProfile.findFirst({
        where: { tenantId: ctx.tenantId, userId },
        include: { user: { select: { name: true, email: true, image: true } } },
      }),
      db.booking.findMany({
        where: { tenantId: ctx.tenantId, userId },
        orderBy: { date: "desc" },
        take: 5,
      }),
      db.programEnrollment.findMany({
        where: { userId, program: { tenantId: ctx.tenantId } },
        include: { program: { select: { name: true } } },
        take: 5,
      }),
      db.payment.findMany({
        where: { tenantId: ctx.tenantId, userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.notification.findMany({
        where: { tenantId: ctx.tenantId, userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  return apiResponse({
    dashboard: {
      profile,
      upcomingBookings: bookings,
      activePrograms: enrollments,
      recentPayments: payments,
      notifications,
    },
    sections: [
      "meals",
      "workouts",
      "progress",
      "payments",
      "bookings",
      "chat",
      "community",
    ],
  });
}
