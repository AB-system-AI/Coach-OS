import { getCurrentTenant } from "@/lib/auth/session";
import { getBookings } from "@/features/bookings";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

export default async function CalendarPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [bookings, events] = await Promise.all([
    getBookings(tenant.id),
    db.calendarEvent.findMany({
      where: { tenantId: tenant.id },
      orderBy: { startAt: "asc" },
      take: 30,
    }),
  ]);

  const items = [
    ...bookings.map((b) => ({
      id: b.id,
      title: `${b.user.name} — ${b.service.name}`,
      date: b.date,
      type: "booking" as const,
      status: b.status,
    })),
    ...events.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.startAt,
      type: "event" as const,
      status: "SCHEDULED",
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground mt-1">
          Week, month, agenda views with Google & Outlook sync.
        </p>
      </div>
      <Card>
        <CardHeader><CardTitle>Upcoming</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between py-3 text-sm">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-muted-foreground">
                  {item.date.toLocaleString()} · {item.type}
                </p>
              </div>
              <Badge variant="outline">{item.status}</Badge>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-muted-foreground py-4">No upcoming events.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
