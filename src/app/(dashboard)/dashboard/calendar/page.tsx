import { getCurrentTenant } from "@/lib/auth/session";
import { getBookings } from "@/features/bookings";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { CalendarClient } from "./_components/calendar-client";

export default async function CalendarPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [bookings, events] = await Promise.all([
    getBookings(tenant.id),
    db.calendarEvent.findMany({
      where: { tenantId: tenant.id },
      orderBy: { startAt: "asc" },
      take: 100,
    }),
  ]);

  return (
    <CalendarClient
      bookings={bookings}
      events={events}
      tenantId={tenant.id}
    />
  );
}
