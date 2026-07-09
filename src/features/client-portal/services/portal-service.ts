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

export async function getPortalPrograms(userId: string) {
  const membership = await db.tenantMember.findFirst({
    where: { userId, role: "CLIENT", isActive: true },
  });
  if (!membership) return [];

  return db.programEnrollment.findMany({
    where: { userId, program: { tenantId: membership.tenantId } },
    include: {
      program: {
        include: {
          workoutPlans: {
            include: { exercises: { orderBy: { order: "asc" } } },
          },
          mealPlans: {
            include: { meals: { include: { recipes: { include: { recipe: true } } } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPortalMeals(userId: string) {
  const membership = await db.tenantMember.findFirst({
    where: { userId, role: "CLIENT", isActive: true },
  });
  if (!membership) return [];

  return db.programEnrollment.findMany({
    where: { userId, program: { tenantId: membership.tenantId } },
    include: {
      program: {
        include: {
          mealPlans: {
            include: {
              meals: {
                include: { recipes: { include: { recipe: true } } },
                orderBy: { mealType: "asc" },
              },
            },
          },
        },
      },
    },
  });
}

export async function getPortalProgress(userId: string) {
  const [weights, measurements, photos] = await Promise.all([
    db.weightEntry.findMany({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      take: 50,
    }),
    db.bodyMeasurement.findMany({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      take: 20,
    }),
    db.progressPhoto.findMany({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      take: 30,
    }),
  ]);
  return { weights, measurements, photos };
}

export async function getPortalBookings(userId: string) {
  const membership = await db.tenantMember.findFirst({
    where: { userId, role: "CLIENT", isActive: true },
  });
  if (!membership) return [];

  return db.booking.findMany({
    where: { tenantId: membership.tenantId, userId },
    include: { service: true },
    orderBy: { date: "desc" },
    take: 50,
  });
}

export async function getPortalInvoices(userId: string) {
  const membership = await db.tenantMember.findFirst({
    where: { userId, role: "CLIENT", isActive: true },
  });
  if (!membership) return { invoices: [], payments: [] };

  const [payments] = await Promise.all([
    db.payment.findMany({
      where: { tenantId: membership.tenantId, userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const invoiceIds = payments.map((p) => p.id).filter(Boolean);
  const invoices = await db.invoice.findMany({
    where: { tenantId: membership.tenantId, paymentId: { in: invoiceIds } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return { invoices, payments };
}

export async function getPortalNotifications(userId: string) {
  const membership = await db.tenantMember.findFirst({
    where: { userId, role: "CLIENT", isActive: true },
  });
  if (!membership) return [];

  return db.notification.findMany({
    where: { userId, tenantId: membership.tenantId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getPortalChatRooms(userId: string) {
  const membership = await db.tenantMember.findFirst({
    where: { userId, role: "CLIENT", isActive: true },
  });
  if (!membership) return [];

  return db.chatRoom.findMany({
    where: {
      tenantId: membership.tenantId,
      messages: { some: { senderId: userId } },
    },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { name: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPortalRoomMessages(roomId: string, userId: string) {
  const membership = await db.tenantMember.findFirst({
    where: { userId, isActive: true },
  });

  const room = await db.chatRoom.findFirst({
    where: {
      id: roomId,
      ...(membership ? { tenantId: membership.tenantId } : {}),
    },
  });
  if (!room) return null;

  const messages = await db.chatMessage.findMany({
    where: { roomId },
    include: { sender: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return { room, messages };
}

export async function getPortalDownloads(userId: string) {
  const membership = await db.tenantMember.findFirst({
    where: { userId, role: "CLIENT", isActive: true },
  });
  if (!membership) return [];

  const client = await db.clientProfile.findUnique({ where: { userId } });
  if (!client) return [];

  return db.clientFile.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPortalCertificates(userId: string) {
  return db.courseEnrollment.findMany({
    where: { userId, certificateUrl: { not: null } },
    include: { course: true },
    orderBy: { completedAt: "desc" },
  });
}
