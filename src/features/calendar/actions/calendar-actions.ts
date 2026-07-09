"use server";

import { revalidatePath } from "next/cache";
import { requireTenantAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function createCalendarEventAction(
  tenantId: string,
  data: {
    title: string;
    description?: string;
    startAt: string;
    endAt: string;
    location?: string;
    color?: string;
  }
) {
  await requireTenantAccess(tenantId);
  const event = await db.calendarEvent.create({
    data: {
      tenantId,
      title: data.title,
      description: data.description,
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
      location: data.location,
      color: data.color,
    },
  });
  revalidatePath("/dashboard/calendar");
  return { id: event.id };
}

export async function deleteCalendarEventAction(tenantId: string, eventId: string) {
  await requireTenantAccess(tenantId);
  await db.calendarEvent.delete({ where: { id: eventId, tenantId } });
  revalidatePath("/dashboard/calendar");
}
