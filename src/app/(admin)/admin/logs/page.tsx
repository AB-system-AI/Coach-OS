import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function AdminLogsPage() {
  await requireRole("SUPER_ADMIN");

  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { name: true } } },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Audit Logs</h1>
      <p className="text-muted-foreground">Activity history with who, when, and what changed.</p>
      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {logs.map((log) => (
            <div key={log.id} className="py-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">{log.action} {log.entity}</span>
                <Badge variant="outline">{log.createdAt.toLocaleString()}</Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                {log.user?.name ?? "System"} {log.entityId && `· ${log.entityId}`}
              </p>
            </div>
          ))}
          {logs.length === 0 && <p className="text-muted-foreground py-4">No audit logs yet.</p>}
        </CardContent>
      </Card>
      <Link href="/admin" className="text-sm text-muted-foreground hover:underline">← Admin</Link>
    </div>
  );
}
