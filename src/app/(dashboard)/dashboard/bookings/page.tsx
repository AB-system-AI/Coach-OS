import { getCurrentTenant } from "@/lib/auth/session";
import { getBookings, getBookingStats } from "@/features/bookings";
import { ModuleOverview } from "@/components/layout/module-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export default async function BookingsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [bookings, stats] = await Promise.all([
    getBookings(tenant.id),
    getBookingStats(tenant.id),
  ]);

  return (
    <div className="space-y-8">
      <ModuleOverview
        title="Bookings"
        description="Client bookings with calendar, reminders, cancel policy, reschedule, and attendance."
        stats={[
          { label: "Upcoming", value: stats.upcoming },
          { label: "Pending", value: stats.pending },
          { label: "Completed", value: stats.completed },
        ]}
        actions={[
          { label: "Calendar", href: "/dashboard/calendar" },
          { label: "Time Slots", href: "/dashboard/recovery" },
        ]}
      />
      <Card>
        <CardHeader><CardTitle>Recent Bookings</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {bookings.map((b) => (
            <div key={b.id} className="flex justify-between py-4">
              <div>
                <p className="font-medium">{b.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {b.service.name} · {b.date.toLocaleDateString()} {b.startTime}
                </p>
              </div>
              <div className="text-end">
                <Badge>{b.status}</Badge>
                <p className="text-sm mt-1">{formatCurrency(Number(b.price))}</p>
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <p className="text-muted-foreground py-4">No bookings yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
