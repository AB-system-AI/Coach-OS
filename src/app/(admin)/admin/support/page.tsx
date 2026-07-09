import { requireRole } from "@/lib/auth/session";
import { getSupportTickets, getSupportStats } from "@/features/support";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function AdminSupportPage() {
  await requireRole("SUPER_ADMIN");
  const [tickets, stats] = await Promise.all([
    getSupportTickets(),
    getSupportStats(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Support Tickets</h1>
      <div className="grid gap-4 md:grid-cols-2 max-w-md">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats.open}</div><p className="text-sm text-muted-foreground">Open</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats.resolved}</div><p className="text-sm text-muted-foreground">Resolved</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Tickets</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {tickets.map((t) => (
            <div key={t.id} className="py-4">
              <div className="flex justify-between">
                <p className="font-medium">{t.subject}</p>
                <Badge>{t.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{t.creator.name} · {t.priority}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Link href="/admin" className="text-sm text-muted-foreground hover:underline">← Admin</Link>
    </div>
  );
}
