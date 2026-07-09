"use server";

import { revalidatePath } from "next/cache";
import { requireTenantAccess } from "@/lib/auth/session";
import {
  createBooking,
  updateBookingStatus,
  cancelBooking,
  rescheduleBooking,
} from "@/features/bookings/services/booking-service";

export async function createBookingAction(
  tenantId: string,
  data: {
    userId: string;
    serviceId: string;
    date: string;
    startTime: string;
    endTime: string;
    price: number;
    notes?: string;
  }
) {
  await requireTenantAccess(tenantId);
  const booking = await createBooking(tenantId, {
    ...data,
    date: new Date(data.date),
    price: data.price,
  });
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/calendar");
  return { id: booking.id };
}

export async function updateBookingStatusAction(
  tenantId: string,
  bookingId: string,
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW"
) {
  await requireTenantAccess(tenantId);
  await updateBookingStatus(tenantId, bookingId, status);
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/calendar");
}

export async function cancelBookingAction(tenantId: string, bookingId: string) {
  await requireTenantAccess(tenantId);
  await cancelBooking(tenantId, bookingId);
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/calendar");
}

export async function rescheduleBookingAction(
  tenantId: string,
  bookingId: string,
  data: { date: string; startTime: string; endTime: string }
) {
  await requireTenantAccess(tenantId);
  await rescheduleBooking(tenantId, bookingId, {
    date: new Date(data.date),
    startTime: data.startTime,
    endTime: data.endTime,
  });
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/calendar");
}
