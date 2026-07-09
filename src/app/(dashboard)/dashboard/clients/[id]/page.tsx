import { getCurrentTenant } from "@/lib/auth/session";
import { getClientById } from "@/features/clients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const client = await getClientById(tenant.id, id);
  if (!client) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/clients" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to clients
        </Link>
        <h1 className="text-3xl font-bold mt-2">{client.user.name}</h1>
        <p className="text-muted-foreground">{client.user.email}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge>{client.subscriptionStatus}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Goal</span>
              <span>{client.goals ?? client.goalType ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span>{client.phone ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Joined</span>
              <span>{client.joinedAt.toLocaleDateString()}</span>
            </div>
            {client.subscriptionEndDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subscription ends</span>
                <span>{client.subscriptionEndDate.toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.activities.length === 0 ? (
              <p className="text-muted-foreground">No activity yet.</p>
            ) : (
              client.activities.map((a) => (
                <div key={a.id} className="border-s-2 border-primary/30 ps-4">
                  <p className="font-medium text-sm">{a.title}</p>
                  {a.description && (
                    <p className="text-sm text-muted-foreground">{a.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {a.type} · {a.createdAt.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notes ({client.notes.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {client.notes.map((n) => (
              <div key={n.id} className="rounded-lg border p-3 text-sm">
                <p>{n.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {n.createdAt.toLocaleString()}
                </p>
              </div>
            ))}
            {client.notes.length === 0 && (
              <p className="text-muted-foreground text-sm">No notes yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Files ({client.files.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {client.files.map((f) => (
              <a
                key={f.id}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border p-3 text-sm hover:bg-muted"
              >
                {f.name}
              </a>
            ))}
            {client.files.length === 0 && (
              <p className="text-muted-foreground text-sm">No files uploaded.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
