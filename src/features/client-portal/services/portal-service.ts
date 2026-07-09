import { db } from "@/lib/db";

export async function getClientPortalData(userId: string) {
  const membership = await db.tenantMember.findFirst({
    where: { userId, role: "CLIENT", isActive: true },
    include: {
      tenant: { include: { theme: true, settings: true } },
    },
  });

  if (!membership) return null;

  const tenantId = membership.tenantId;
  const client = await db.clientProfile.findUnique({
    where: { userId },
  });

  const [enrollments, bookings, payments, notifications, checkIns] =
    await Promise.all([
      db.programEnrollment.findMany({
        where: { userId, program: { tenantId } },
        include: {
          program: {
            include: {
              workoutPlans: {
                take: 7,
                include: { exercises: { orderBy: { order: "asc" } } },
              },
              mealPlans: {
                take: 1,
                include: { meals: { include: { recipes: { include: { recipe: true } } } } },
              },
            },
          },
        },
      }),
      db.booking.findMany({
        where: { tenantId, userId },
        include: { service: true },
        orderBy: { date: "desc" },
        take: 5,
      }),
      db.payment.findMany({
        where: { tenantId, userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.notification.findMany({
        where: { userId, tenantId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      client
        ? db.weeklyCheckIn.findMany({
            where: { clientId: client.id },
            orderBy: { weekStartDate: "desc" },
            take: 5,
          })
        : [],
    ]);

  const weights = await db.weightEntry.findMany({
    where: { userId },
    orderBy: { recordedAt: "asc" },
    take: 30,
  });

  return {
    tenant: membership.tenant,
    client,
    enrollments,
    bookings,
    payments,
    notifications,
    checkIns,
    weights,
  };
}
