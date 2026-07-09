import { getSession } from "@/lib/auth/session";
import { getPortalNotifications } from "@/features/client-portal/services/portal-service";
import { markNotificationRead, markAllNotificationsRead } from "@/features/client-portal/actions/portal-actions";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck } from "lucide-react";

export default async function PortalNotificationsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const notifications = await getPortalNotifications(session.user.id);
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            {unread > 0 ? `${unread} unread notification${unread > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unread > 0 && (
          <form action={markAllNotificationsRead}>
            <Button variant="outline" size="sm" type="submit">
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          </form>
        )}
      </div>

      {notifications.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
            No notifications yet.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="divide-y pt-0">
          {notifications.map((n) => (
            <div key={n.id} className={`flex items-start gap-4 py-4 ${!n.isRead ? "bg-muted/30 -mx-6 px-6" : ""}`}>
              <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${n.isRead ? "bg-transparent" : "bg-primary"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{n.title}</p>
                    {n.message && <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{n.type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {!n.isRead && (
                    <form action={async () => {
                      "use server";
                      await markNotificationRead(n.id);
                    }}>
                      <Button variant="ghost" size="sm" type="submit" className="text-xs">
                        Mark read
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
