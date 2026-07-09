import { getSession } from "@/lib/auth/session";
import { getPortalBookings } from "@/features/client-portal/services/portal-service";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default async function PortalBookingsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const bookings = await getPortalBookings(session.user.id);

  const upcoming = bookings.filter((b) => new Date(b.date) >= new Date());
  const past = bookings.filter((b) => new Date(b.date) < new Date());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-muted-foreground text-sm">Your upcoming and past sessions.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{bookings.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Upcoming</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{upcoming.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.filter((b) => b.status === "COMPLETED").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {upcoming.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Upcoming Sessions</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {upcoming.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-sm">{b.service.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(b.date).toLocaleDateString()} at{" "}
                    {b.startTime ?? "TBD"}
                    {b.service.duration && ` · ${b.service.duration} min`}
                  </p>
                </div>
                <div className="text-end">
                  <Badge variant="outline">{b.status}</Badge>
                  {b.price && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(Number(b.price))}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {past.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Past Sessions</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {past.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-sm">{b.service.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(b.date).toLocaleDateString()}
                    {b.notes && ` · ${b.notes}`}
                  </p>
                </div>
                <Badge
                  variant={b.status === "COMPLETED" ? "default" : b.status === "CANCELLED" ? "destructive" : "secondary"}
                >
                  {b.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {bookings.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No bookings found. Contact your coach to schedule a session.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
