import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";
import { logClientActivity } from "@/lib/activity";

export async function getBookings(tenantId: string, status?: string) {
  await requireTenantAccess(tenantId);
  return db.booking.findMany({
    where: {
      tenantId,
      ...(status ? { status: status as "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW" } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      service: { select: { name: true, duration: true } },
    },
    orderBy: { date: "desc" },
    take: 100,
  });
}

export async function createBooking(
  tenantId: string,
  data: {
    userId: string;
    serviceId: string;
    date: Date;
    startTime: string;
    endTime: string;
    price: number;
    notes?: string;
  }
) {
  const booking = await db.booking.create({
    data: {
      tenantId,
      ...data,
      status: "PENDING",
      currency: "USD",
    },
  });

  const client = await db.clientProfile.findFirst({
    where: { tenantId, userId: data.userId },
  });
  if (client) {
    await logClientActivity({
      tenantId,
      clientId: client.id,
      type: "BOOKING",
      title: "Booking created",
      metadata: { bookingId: booking.id },
    });
  }

  return booking;
}

export async function updateBookingStatus(
  tenantId: string,
  bookingId: string,
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW"
) {
  await requireTenantAccess(tenantId);
  return db.booking.update({
    where: { id: bookingId, tenantId },
    data: { status },
  });
}

export async function rescheduleBooking(
  tenantId: string,
  bookingId: string,
  data: { date: Date; startTime: string; endTime: string }
) {
  await requireTenantAccess(tenantId);
  return db.booking.update({
    where: { id: bookingId, tenantId },
    data: { ...data, status: "CONFIRMED" },
  });
}

export async function getTimeSlots(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.timeSlot.findMany({
    where: { tenantId, isActive: true },
    orderBy: { dayOfWeek: "asc" },
  });
}

export async function cancelBooking(tenantId: string, bookingId: string) {
  await requireTenantAccess(tenantId);
  return db.booking.update({
    where: { id: bookingId, tenantId },
    data: { status: "CANCELLED" },
  });
}

export async function getBookingStats(tenantId: string) {
  await requireTenantAccess(tenantId);
  const [upcoming, pending, completed] = await Promise.all([
    db.booking.count({
      where: { tenantId, status: { in: ["PENDING", "CONFIRMED"] } },
    }),
    db.booking.count({ where: { tenantId, status: "PENDING" } }),
    db.booking.count({ where: { tenantId, status: "COMPLETED" } }),
  ]);
  return { upcoming, pending, completed };
}
