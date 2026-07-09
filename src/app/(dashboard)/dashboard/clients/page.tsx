import { getCurrentTenant } from "@/lib/auth/session";
import { getClients, getClientStats } from "@/features/clients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, Plus } from "lucide-react";

export default async function ClientsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [clients, stats] = await Promise.all([
    getClients(tenant.id),
    getClientStats(tenant.id),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground mt-1">
            Manage client profiles, subscriptions, notes, files, and activity timeline.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/clients/new">
            <Plus className="h-4 w-4 me-2" />
            Add Client
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Clients", value: stats.total },
          { label: "Active", value: stats.active },
          { label: "Expired", value: stats.expired },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Clients
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {clients.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No clients yet.</p>
          ) : (
            clients.map((client) => (
              <Link
                key={client.id}
                href={`/dashboard/clients/${client.id}`}
                className="flex items-center justify-between py-4 hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <p className="font-medium">{client.user.name}</p>
                  <p className="text-sm text-muted-foreground">{client.user.email}</p>
                  {client.goals && (
                    <p className="text-xs text-muted-foreground mt-1">Goal: {client.goals}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={client.isActive ? "default" : "secondary"}>
                    {client.subscriptionStatus}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {client._count.activities} activities
                  </span>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
